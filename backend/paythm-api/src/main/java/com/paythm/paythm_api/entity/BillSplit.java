package com.paythm.paythm_api.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "bill_splits")
public class BillSplit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private double totalAmount;
    private String date;
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @ElementCollection
    @CollectionTable(name = "bill_split_participants", joinColumns = @JoinColumn(name = "bill_split_id"))
    private List<Participant> participants;

    @Embeddable
    public static class Participant {
        private String name;
        private double amount;
        private String status;

        public Participant() {
        }

        public Participant(String name, double amount, String status) {
            this.name = name;
            this.amount = amount;
            this.status = status;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public BillSplit() {
    }

    public BillSplit(String description, double totalAmount, String date, String status, List<Participant> participants,
            User user) {
        this.description = description;
        this.totalAmount = totalAmount;
        this.date = date;
        this.status = status;
        this.participants = participants;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<Participant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<Participant> participants) {
        this.participants = participants;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
