import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from 'react';
import { Register } from './Register'

export const Login = ({ goToMenu }) => {
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    goToMenu();

    Meteor.loginWithPassword(username, password);
  };

  const goToLogin = () => {
    setRegister(false)
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
          <button type="submit" class="btn btn-primary size mb-3">Sign In</button>
          <button type="button" class="btn btn-secondary size"  onClick={() => setRegister(true)}>Register</button>
        </form>
      )}
    </Fragment>
  );

};
