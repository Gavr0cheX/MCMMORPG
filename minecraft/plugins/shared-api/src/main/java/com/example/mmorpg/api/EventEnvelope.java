package com.example.mmorpg.api;

public record EventEnvelope(String id, String type, Object payload, String publishedAt, String source) {
}
