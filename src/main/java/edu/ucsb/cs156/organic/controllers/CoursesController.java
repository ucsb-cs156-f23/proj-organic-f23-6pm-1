package edu.ucsb.cs156.organic.controllers;

import edu.ucsb.cs156.organic.entities.Course;
import edu.ucsb.cs156.organic.entities.Staff;
import edu.ucsb.cs156.organic.entities.User;
import edu.ucsb.cs156.organic.repositories.CourseRepository;
import edu.ucsb.cs156.organic.repositories.StaffRepository;
import edu.ucsb.cs156.organic.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.organic.errors.EntityNotFoundException;

import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;

import javax.transaction.Transactional;
import javax.validation.Valid;

import java.util.Optional;


@Tag(name = "Courses")
@RequestMapping("/api/courses")
@RestController
@Slf4j
public class CoursesController extends ApiController {

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    StaffRepository courseStaffRepository;

    @Autowired
    UserRepository userRepository;

    @Operation(summary = "List all courses")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Course> allCourses() {
        User u = getCurrentUser().getUser();
        log.info("u={}", u);
        if (u.isAdmin()) {
            return courseRepository.findAll();
        } else {
            return courseRepository.findCoursesStaffedByUser(u.getGithubId());
        }
    }

    @Operation(summary= "Get a single course")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("")
    public Course getById(
            @Parameter(name="id") @RequestParam Long id) {
        User u = getCurrentUser().getUser();

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id));
        
        if(!u.isAdmin()){
                courseStaffRepository.findByCourseIdAndGithubId(id, u.getGithubId())
                        .orElseThrow(() -> new AccessDeniedException(
                        String.format("User %s is not authorized to get course %d", u.getGithubLogin(), id)));
        }
        return course;
    }

    @Operation(summary = "Create a new course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public Course postCourse(
            @Parameter(name = "name", description ="course name, e.g. CMPSC 156" ) @RequestParam String name,
            @Parameter(name = "school", description ="school abbreviation e.g. UCSB" ) @RequestParam String school,
            @Parameter(name = "term", description = "quarter or semester, e.g. F23") @RequestParam String term,
            @Parameter(name = "startDate", description = "in iso format, i.e. YYYY-mm-ddTHH:MM:SS; e.g. 2023-10-01T00:00:00 see https://en.wikipedia.org/wiki/ISO_8601") @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(name = "endDate", description = "in iso format, i.e. YYYY-mm-ddTHH:MM:SS; e.g. 2023-12-31T11:59:59 see https://en.wikipedia.org/wiki/ISO_8601") @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(name = "githubOrg", description = "for example ucsb-cs156-f23" ) @RequestParam String githubOrg)
            throws JsonProcessingException {

        Course course = Course.builder()
                .name(name)
                .school(school)
                .term(term)
                .startDate(startDate)
                .endDate(endDate)
                .githubOrg(githubOrg)
                .build();

        Course savedCourse = courseRepository.save(course);
        User u = getCurrentUser().getUser();

        Staff courseStaff = Staff.builder()
                .courseId(savedCourse.getId())
                .githubId(u.getGithubId())
                .build();

        log.info("courseStaff={}", courseStaff);
        courseStaffRepository.save(courseStaff);

        return savedCourse;
    }

    @Operation(summary = "Add a staff member to a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/addStaff")
    public Staff addStaff(
            @Parameter(name = "courseId") @RequestParam Long courseId,
            @Parameter(name = "githubLogin") @RequestParam String githubLogin)
            throws JsonProcessingException {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, courseId.toString()));

        User user = userRepository.findByGithubLogin(githubLogin)
                .orElseThrow(() -> new EntityNotFoundException(User.class, githubLogin.toString()));

        Staff courseStaff = Staff.builder()
                .courseId(course.getId())
                .githubId(user.getGithubId())
                .user(user)
                .build();

        courseStaff = courseStaffRepository.save(courseStaff);
        log.info("courseStaff={}", courseStaff);

        return courseStaff;
    }

    @Operation(summary = "Remove staff from a course")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INSTRUCTOR')")
    @DeleteMapping("/staff")
    public Object deleteStaff(
            @Parameter(name = "id") @RequestParam Long id) throws JsonProcessingException {
        // Find staff member from id (also includes associated data like which course(s) they're staff in)
        Staff staff = courseStaffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id.toString()));
        
        // If instructor and not admin, check if user is staff in the same course of the staff member they're trying to remove
        User u = getCurrentUser().getUser();
        if (!u.isAdmin()) {
                Long courseId = staff.getCourseId();
                log.info("staff={}\nthe parameter id={}", staff, id);
                courseStaffRepository.findByCourseIdAndGithubId(courseId, u.getGithubId()) // This find will succeed if the condition mentioned above is met
                .orElseThrow(() -> new AccessDeniedException( // Throw an error if find fails (so, if they aren't in the same course)
                        String.format("User %s is not authorized to delete staff of id %d", u.getGithubLogin(), id)));
        }

        courseStaffRepository.delete(staff);
        return genericMessage("Staff with id %s deleted".formatted(id));
    }

    @Operation(summary = "Get Staff for course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/getStaff")
    public Iterable<Staff> getStaff(
            @Parameter(name = "courseId") @RequestParam Long courseId
    )
            throws JsonProcessingException {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, courseId.toString()));

        Iterable<Staff> courseStaff = courseStaffRepository.findByCourseId(course.getId());
        return courseStaff;
    }

    @Operation(summary = "Update a course")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INSTRUCTOR')")
    @PutMapping("")
    public Course updateCourse(
            @Parameter(name = "courseId") @RequestParam Long courseId,
            @RequestBody @Valid Course incoming) throws JsonProcessingException {
        
        User u = getCurrentUser().getUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, courseId.toString()));
        if(!u.isAdmin())
            courseStaffRepository.findByCourseIdAndGithubId(courseId, u.getGithubId())
            .orElseThrow(() -> new AccessDeniedException(
                String.format("User %s is not authorized to update course %d", u.getGithubLogin(), courseId)));

        course.setName(incoming.getName());
        course.setSchool(incoming.getSchool());
        course.setTerm(incoming.getTerm());
        course.setStartDate(incoming.getStartDate());
        course.setEndDate(incoming.getEndDate());
        course.setGithubOrg(incoming.getGithubOrg());

        courseRepository.save(course);
        return course;
    }

    @Transactional
    @Operation(summary = "Delete a course")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INSTRUCTOR')")
    @DeleteMapping("")
    public Object deleteCourse(
            @Parameter(name = "id") @RequestParam Long id) throws JsonProcessingException {
        
        User u = getCurrentUser().getUser();
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Course.class, id.toString()));
        if(!u.isAdmin())
            courseStaffRepository.findByCourseIdAndGithubId(id, u.getGithubId())
            .orElseThrow(() -> new AccessDeniedException(
                String.format("User %s is not authorized to delete course %d", u.getGithubLogin(), id)));

        courseRepository.delete(course);
        courseStaffRepository.deleteByCourseId(id);
        return genericMessage("Course with id %s deleted".formatted(id));
    }
}
