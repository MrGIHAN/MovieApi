package dev.gihan.movieapi.service.impl;

import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.UserPreferences;
import dev.gihan.movieapi.repository.UserPreferencesRepository;
import dev.gihan.movieapi.service.UserPreferencesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserPreferencesServiceImpl implements UserPreferencesService {

    @Autowired
    private UserPreferencesRepository preferencesRepository;

    @Override
    public UserPreferences getPreferences(User user) {
        return preferencesRepository.findByUser(user).orElse(new UserPreferences());
    }

    @Override
    public UserPreferences updatePreferences(User user, UserPreferences preferences) {
        preferences.setUser(user);
        return preferencesRepository.save(preferences);
    }
} 