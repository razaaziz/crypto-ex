import React, { Component } from 'react';
import Identicon from 'identicon.js';
// import logo from '../logo.png';

class Navbar extends Component {

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark bg-dark flex-md-nowrap p-0 shadow">
            <p className="navbar-brand mr-0">EthSwap</p>
            {/* <img src={logo} className="navbar-brand mr-0 ml-4" alt="logo" /> */}
            <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    <small className="text-secondary">
                        <b id="account">{this.props.account}</b> {/* Fetch data past this component */}
                    </small>

                    { this.props.account
                        ? <img
                            className= "ml-2"
                            width= "30"
                            height= "30"
                            src= {`data: image/png;base64, ${new Identicon(this.props.account, 30).toString()}`}
                            alt= ""
                        />
                        : <span></span>
                    }
                </li>
            </ul>
        </nav>
      </div>
    );
  }
}

export default Navbar;
