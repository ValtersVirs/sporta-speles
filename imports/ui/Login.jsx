import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';
import { Register } from './Register'

export const Login = ({ goToMenu }) => {
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        setError(true)
      } else {
        goToMenu();
      }
    });
  };

  const goToLogin = () => {
    setRegister(false)
    setError(false)
  }

  return (
    <Fragment>
      {register ? (
        <Register
          goToMenu={goToMenu}
          goToLogin={goToLogin}
        />
      ) : (
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
          {error ? (
            <span class="text-danger text-center size">Invalid username or password</span>
          ) : ""}
          <button type="submit" class="btn btn-main size my-3">Sign In</button>
          <button type="button" class="btn btn-main2 size"  onClick={() => setRegister(true)}>Register</button>
        </form>
      )}
    </Fragment>
  );

};
