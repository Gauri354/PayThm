package com.paythm.paythm_api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paythm.paythm_api.dto.MarketData;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*")
public class MarketController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, String> SYMBOLS = new HashMap<>() {
        {
            put("NIFTY 50", "^NSEI");
            put("SENSEX", "^BSESN");
            put("PAYTHM", "PAYTM.NS");
            put("BITCOIN", "BTC-USD");
        }
    };

    @GetMapping("/live")
    public ResponseEntity<List<MarketData>> getLiveMarketData() {
        List<MarketData> dataList = new ArrayList<>();

        for (Map.Entry<String, String> entry : SYMBOLS.entrySet()) {
            String displayName = entry.getKey();
            String ticker = entry.getValue();
            try {
                MarketData data = fetchStockData(displayName, ticker);
                dataList.add(data);
            } catch (Exception e) {
                // Return dummy data if fetch fails to avoid breaking UI
                System.err.println("Failed to fetch data for " + displayName + ": " + e.getMessage());
                dataList.add(new MarketData(displayName, 0.0, 0.0, 0.0, true));
            }
        }

        // Sort to maintain order: NIFTY, SENSEX, PAYTHM, BITCOIN
        // Minimal sort logic or just rely on insertion order if Map was LinkedHashMap,
        // but it's HashMap.
        // Let's manually order or simple sort.
        dataList.sort((a, b) -> {
            if (a.getSymbol().equals("NIFTY 50"))
                return -1;
            if (b.getSymbol().equals("NIFTY 50"))
                return 1;
            if (a.getSymbol().equals("SENSEX"))
                return -1;
            if (b.getSymbol().equals("SENSEX"))
                return 1;
            if (a.getSymbol().equals("PAYTHM"))
                return -1;
            if (b.getSymbol().equals("PAYTHM"))
                return 1;
            return 0;
        });

        return ResponseEntity.ok(dataList);
    }

    private MarketData fetchStockData(String displayName, String ticker) throws Exception {
        String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + ticker + "?interval=1d&range=1d";
        // User-Agent is sometimes required by Yahoo
        // RestTemplate might need headers, but let's try simple first.
        // Often Yahoo blocks requests without User-Agent.

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");
        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity,
                String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode meta = root.path("chart").path("result").get(0).path("meta");

        double currentPrice = meta.path("regularMarketPrice").asDouble();
        double previousClose = meta.path("chartPreviousClose").asDouble();

        // Sometimes previousClose is missing, try 'previousClose' field
        if (previousClose == 0)
            previousClose = meta.path("previousClose").asDouble();

        double change = currentPrice - previousClose;
        double changePercent = (change / previousClose) * 100;

        return new MarketData(
                displayName,
                currentPrice,
                change,
                changePercent,
                change >= 0);
    }
}
