package dev.gihan.movieapi.dto.requestDto;

import lombok.Data;

import java.util.List;

@Data
public class SearchRequestDto {
    private String query;
    private List<String> genres;
    private Integer yearFrom;
    private Integer yearTo;
    private Double ratingFrom;
    private Double ratingTo;
    private String sortBy; // title, year, rating, views
    private String sortDirection; // asc, desc
    private Integer page;
    private Integer size;
}