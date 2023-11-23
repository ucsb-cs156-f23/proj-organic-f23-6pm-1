package edu.ucsb.cs156.organic.controllers;

import org.springframework.beans.factory.annotation.Autowired;

import edu.ucsb.cs156.organic.entities.Staff;
import edu.ucsb.cs156.organic.errors.EntityNotFoundException;
import edu.ucsb.cs156.organic.models.CurrentUser;
import edu.ucsb.cs156.organic.services.CurrentUserService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.AnnotatedMember;
import com.fasterxml.jackson.databind.introspect.JacksonAnnotationIntrospector;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.Map;

/**
 * Base class for all API controllers.  Provides a getCurrentUser() method
 * and a genericMessage() method.
 */
 */

@Slf4j
public abstract class ApiController {
  @Autowired
  private CurrentUserService currentUserService;

  /**
   * Returns the current user, or null if no user is logged in.
   * @return CurrentUser current user or null
   */
  protected CurrentUser getCurrentUser() {
    return currentUserService.getCurrentUser();
  }

  /*
   * Returns a generic message in the form of a Map 
   * with a single key/value pair
   * 
   * @param message the message to be returned
   * @return Map with a single key/value pair
   */
  protected Object genericMessage(String message) {
    return Map.of("message", message);
  }
  
  /**
   * Exception handler to return HTTP status code 400 Bad Request
   * when an IllegalArgumentException is thrown
   * @param e IllegalArgumentException
   * @return map with type and message
   */
  @ExceptionHandler({ IllegalArgumentException.class})
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Object handleIllegalArgumentException(Throwable e) {
    Map<String,String> map =  Map.of(
      "type", e.getClass().getSimpleName(),
      "message", e.getMessage()
    );
    log.error("Exception thrown: {}", map);
    return map;
  }

  /**
   * Exception handler to return HTTP status code 404 Not Found
   * when an EntityNotFoundException is thrown
   * @param e EntityNotFoundException
   * @return map with type and message
   */
  @ExceptionHandler({ EntityNotFoundException.class })
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public Object handleGenericException(Throwable e) {
    return Map.of(
      "type", e.getClass().getSimpleName(),
      "message", e.getMessage()
    );
  }

  /**
   * Exception handler to return HTTP status code 403 Forbidden 
   * when an AccessDeniedException is thrown
   * @param e AccessDeniedException
   * @return map with type and message
   */
  @ExceptionHandler({ AccessDeniedException.class })
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public Object handleAccessDeniedException(Throwable e) {
    return Map.of(
      "type", e.getClass().getSimpleName(),
      "message", e.getMessage()
    );
  }

  private ObjectMapper mapper;

  /**
   * Special ObjectMapper that ignores Mockito mocks
   * @return ObjectMapper mapper
   */
  public ObjectMapper getMapper() {
    return mapper;
  }

  /**
   * Constructor that initializes the ObjectMapper
   */

  public ApiController() {
   mapper = mapperThatIgnoresMockitoMocks();
  }

  /**
   * Special ObjectMapper that ignores Mockito mocks
   * @return ObjectMapper mapper
   */
  
  public static ObjectMapper mapperThatIgnoresMockitoMocks() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new JavaTimeModule());
    mapper.setAnnotationIntrospector(new JacksonAnnotationIntrospector() {
      @Override
      public boolean hasIgnoreMarker(final AnnotatedMember m) {
        return super.hasIgnoreMarker(m) || m.getName().contains("Mockito");
      }
    });
    return mapper;
  }
}
