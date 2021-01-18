import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';

export const Register = ({ goToMenu, goToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    if (!username || !password) return;

    goToMenu();

    Accounts.createUser({
      username: username,
      password: password,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div class="vertical-input-group mb-3 mt-0">
        <div class="input-group">
          <input
            type="text"
            placeholder="Username"
            class="form-control"
            name="username"
            required
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div class="input-group">
          <input
            type="password"
            placeholder="Password"
            class="form-control"
            name="password"
            required
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" class="btn btn-primary size mb-3">Create an account</button>
      <button type="button" class="btn btn-secondary size" onClick={goToLogin}>Back</button>
    </form>
  );

};
