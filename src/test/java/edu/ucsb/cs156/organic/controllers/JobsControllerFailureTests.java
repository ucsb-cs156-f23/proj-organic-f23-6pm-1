package edu.ucsb.cs156.organic.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.awaitility.Awaitility.await;

import static java.util.concurrent.TimeUnit.SECONDS;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import edu.ucsb.cs156.organic.entities.User;
import edu.ucsb.cs156.organic.entities.jobs.Job;
import edu.ucsb.cs156.organic.repositories.UserRepository;
import edu.ucsb.cs156.organic.repositories.jobs.JobsRepository;
import edu.ucsb.cs156.organic.services.jobs.JobService;
import lombok.extern.slf4j.Slf4j;

import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

@Slf4j
@WebMvcTest(controllers = JobsController.class)
@Import(JobService.class)
@AutoConfigureDataJpa
public class JobsControllerFailureTests extends ControllerTestCase {

        @Captor
        ArgumentCaptor<Job> jobCaptor;

        @MockBean
        JobsRepository jobsRepository;

        @MockBean
        UserRepository userRepository;

        @Autowired
        JobService jobService;

        @Autowired
        ObjectMapper objectMapper;


        @WithMockUser(roles = { "ADMIN" })
        @Test
        public void admin_can_launch_test_job_that_fails() throws Exception {

                // arrange

                User user = currentUserService.getUser();

                Job jobStarted = Job.builder()
                                .id(0L)
                                .createdBy(user)
                                .createdAt(null)
                                .updatedAt(null)
                                .status("running")
                                .log("Hello World! from test job!")
                                .build();

                Job jobFailed = Job.builder()
                                .id(0L)
                                .createdBy(user)
                                .createdAt(null)
                                .updatedAt(null)
                                .status("error")
                                .log("Hello World! from test job!\nFail!")
                                .build();

                when(jobsRepository.save(eq(jobStarted))).thenReturn(jobStarted);
                when(jobsRepository.save(eq(jobFailed))).thenReturn(jobFailed);

                // act
                MvcResult response = mockMvc
                                .perform(post("/api/jobs/launch/testjob?fail=true&sleepMs=2000").with(csrf()))
                                .andExpect(status().isOk()).andReturn();

                String responseString = response.getResponse().getContentAsString();
                Job jobReturned = objectMapper.readValue(responseString, Job.class);

                assertEquals("running", jobReturned.getStatus());

                await().atMost(8, SECONDS)
                                .untilAsserted(() -> {
                                        verify(jobsRepository, atLeast(3)).save(jobCaptor.capture());
                                });

                List<Job> values = jobCaptor.getAllValues();
                log.info("values.size()={}", values.size());
                log.info("values={}", values);

                boolean errorFound = false;
                for (Job j : values) {
                        log.info("j={}", j);
                        if (j.getStatus().equals("error")) {
                                errorFound = true;
                                break;
                        }
                }
                assertTrue(errorFound, "should have found at least one value with status error");
        }

}