package com.cafeaurora;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.*;
@RestControllerAdvice
public class ApiErrorHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class)ResponseEntity<Map<String,String>> invalid(MethodArgumentNotValidException e){
  return ResponseEntity.badRequest().body(Map.of("message","Dados inválidos; verifique os campos"));
 }
 @ExceptionHandler(IllegalArgumentException.class)ResponseEntity<Map<String,String>> illegal(IllegalArgumentException e){
  return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));
 }
 @ExceptionHandler(DataIntegrityViolationException.class)ResponseEntity<Map<String,String>> conflict(DataIntegrityViolationException e){
  return ResponseEntity.status(409).body(Map.of("message","Dados duplicados ou inválidos"));
 }
 @ExceptionHandler(ResponseStatusException.class)ResponseEntity<Map<String,String>> status(ResponseStatusException e){
  return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Erro":e.getReason()));
 }
}