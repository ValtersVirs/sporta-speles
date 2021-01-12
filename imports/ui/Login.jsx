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
        <div className="login">
          <form onSubmit={handleSubmit} className="login-form">
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

            <button type="submit">Log In</button>
          </form>

          <button onClick={() => setRegister(true)}>Register</button>
        </div>
      )}
    </Fragment>
  );

};
