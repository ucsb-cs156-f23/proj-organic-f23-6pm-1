package edu.ucsb.cs156.organic.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.organic.errors.EntityNotFoundException;
import edu.ucsb.cs156.organic.entities.User;
import edu.ucsb.cs156.organic.repositories.UserRepository;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

@Tag(name = "User information (admin only)")
@RequestMapping("/api/admin/users")
@RestController
public class UsersController extends ApiController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    ObjectMapper mapper;

    @Operation(summary = "Get a list of all users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("")
    public ResponseEntity<String> users()
            throws JsonProcessingException {
        Iterable<User> users = userRepository.findAll();
        String body = mapper.writeValueAsString(users);
        return ResponseEntity.ok().body(body);
    }

    @Operation(summary = "Toggle the admin status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/toggleAdmin")
    public Object toggleAdmin( @Parameter(name = "Github Id", description = "Integer, github id of user to toggle their admin status", example = "1", required = true) @RequestParam Integer id){
        User user = userRepository.findByGithubId(id).orElseThrow(() -> new EntityNotFoundException(User.class, id));
        user.setAdmin(!user.isAdmin());
        userRepository.save(user);
        return Map.of("message", "User with id %s has toggled admin status to %s".formatted(id, user.isAdmin()));
    }

    @Operation(summary = "Toggle the instructor status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/toggleInstructor")
    public Object toggleInstructor( @Parameter(name = "Github Id", description = "Integer, github id of user to toggle their instructor status", example = "1", required = true) @RequestParam Integer id){
        User user = userRepository.findByGithubId(id).orElseThrow(() -> new EntityNotFoundException(User.class, id));
        user.setInstructor(!user.isInstructor());
        userRepository.save(user);
        return Map.of("message", "User with id %s has toggled instructor status to %s".formatted(id, user.isInstructor()));
    }

}