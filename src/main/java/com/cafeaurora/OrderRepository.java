package com.cafeaurora;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByClienteIdOrderByCriadoEmDesc(Long clienteId);

    List<OrderEntity> findAllByOrderByCriadoEmDesc();
}
