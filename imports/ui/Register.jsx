import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';

export const Register = ({ goToMenu }) => {
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
      Register
      <div>
        <label htmlFor="username">Username</label>

        <input
          type="text"
          placeholder="Username"
          name="username"
          required
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>

        <input
          type="password"
          placeholder="Password"
          name="password"
          required
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <button type="submit">Register</button>
    </form>
  );

};
