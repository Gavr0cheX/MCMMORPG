package com.example.mmorpg.api;

import com.google.gson.Gson;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public final class ApiClient {
    private static final Gson GSON = new Gson();

    private final HttpClient client;
    private final String baseUrl;
    private final String internalToken;

    public ApiClient(String baseUrl, String internalToken) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.internalToken = internalToken;
        this.client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .version(HttpClient.Version.HTTP_1_1)
            .build();
    }

    public String postInternal(String path, Map<String, Object> payload) throws IOException, InterruptedException {
        Map<String, Object> body = new HashMap<>(payload);
        body.put("token", internalToken);
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .timeout(Duration.ofSeconds(8))
            .version(HttpClient.Version.HTTP_1_1)
            .header("content-type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body)))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new IOException("API request failed: " + response.statusCode() + " " + response.body());
        }

        return response.body();
    }

    public <T> T postInternal(String path, Map<String, Object> payload, Class<T> responseType) throws IOException, InterruptedException {
        return GSON.fromJson(postInternal(path, payload), responseType);
    }
}
