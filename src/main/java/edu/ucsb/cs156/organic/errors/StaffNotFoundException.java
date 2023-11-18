package edu.ucsb.cs156.organic.errors;

public class StaffNotFoundException extends RuntimeException {
  public StaffNotFoundException(Object staffId, Object courseId) {
    super("Staff with Github id %s not found in course staff of course id %s"
        .formatted(staffId.toString(), courseId.toString()));
  }
}