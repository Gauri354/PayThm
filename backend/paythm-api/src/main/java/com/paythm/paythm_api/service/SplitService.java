package com.paythm.paythm_api.service;

import com.paythm.paythm_api.entity.BillSplit;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@org.springframework.stereotype.Service
public class SplitService {

    private final com.paythm.paythm_api.repository.BillSplitRepository repo;
    private final com.paythm.paythm_api.repository.UserRepository userRepo;

    public SplitService(com.paythm.paythm_api.repository.BillSplitRepository repo,
            com.paythm.paythm_api.repository.UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    public BillSplit addSplit(BillSplit split, Long userId) {
        com.paythm.paythm_api.entity.User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        split.setUser(user);
        return repo.save(split);
    }

    public List<BillSplit> getSplits(Long userId) {
        return repo.findByUserId(userId);
    }
}
