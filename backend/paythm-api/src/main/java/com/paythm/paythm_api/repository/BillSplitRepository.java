package com.paythm.paythm_api.repository;

import com.paythm.paythm_api.entity.BillSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillSplitRepository extends JpaRepository<BillSplit, Long> {
    List<BillSplit> findByUserId(Long userId);
}
