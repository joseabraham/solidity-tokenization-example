//SPDX-License-Identifier: Unlicensed
pragma solidity >=0.6.0;

import "./ERC20Mintable.sol";

contract MyToken is ERC20Mintable {
    constructor() ERC20Mintable("StarDucks Capu-Token", "SCT") public {        
    _setupDecimals(0);
    }
}   