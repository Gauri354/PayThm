package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.entity.BillSplit;
import com.paythm.paythm_api.service.SplitService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/splits")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class SplitController {

    private final SplitService service;

    public SplitController(SplitService service) {
        this.service = service;
    }

    @PostMapping
    public BillSplit addSplit(@RequestBody BillSplit split, @RequestParam Long userId) {
        return service.addSplit(split, userId);
    }

    @GetMapping
    public List<BillSplit> getSplits(@RequestParam Long userId) {
        return service.getSplits(userId);
    }
}
