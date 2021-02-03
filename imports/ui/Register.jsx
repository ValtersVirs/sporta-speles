import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';

export const Register = ({ goToMenu, goToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [length, setLength] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    if (!username || !password) return;

    if (username.length > 20) {
      setLength(true)
      return
    }

    goToMenu();

    Accounts.createUser({
      username: username,
      password: password,
      profile: {
        wins: 0,
        games: 0,
      }
    }, (err) => {
      if (err) {
        setLength(false)
        setError(true)
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div class="vertical-input-group my-0">
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
      {length ? (
        <span class="text-danger text-center size">Username cannot exceed 20 characters</span>
      ) : (
        <Fragment>
          {error ? (
            <span class="text-danger text-center size">Username already exists</span>
          ) : ""}
        </Fragment>
      )}
      <button type="submit" class="btn btn-main size my-3">Create an account</button>
      <button type="button" class="btn btn-main2 size" onClick={goToLogin}>Back</button>
    </form>
  );

};
