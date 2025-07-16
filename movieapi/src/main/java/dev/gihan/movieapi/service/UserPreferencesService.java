package dev.gihan.movieapi.service;

import dev.gihan.movieapi.model.UserPreferences;
import dev.gihan.movieapi.model.User;

public interface UserPreferencesService {
    UserPreferences getPreferences(User user);
    UserPreferences updatePreferences(User user, UserPreferences preferences);
} 