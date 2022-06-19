import React from 'react';
import {Link, Route} from 'react-router-dom';
import {AppBar, Toolbar, Menu, MenuItem, Button, Typography } from '@material-ui/core';


function NavBar() {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h4" component="h4" style={{ marginRight: 16 }}>Be The Taskmaster</Typography>
                <div>
                    <Button aria-controls="series-menu" aria-haspopup="true" onClick={handleClick}>
                        <h2>Series</h2>
                    </Button>
                    <Button>
                        <h2>FAQ</h2>
                    </Button>
                    <Menu
                        id="series-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        getContentAnchorEl={null}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        transformOrigin={{ vertical: "top", horizontal: "center"}}
                    >
                        <MenuItem onClick={handleClose}>
                            <Link to={'/1'}> Series One </Link>
                        </MenuItem>
                        <MenuItem onClick={handleClose}>Series Two</MenuItem>
                    </Menu>
                </div>
            </Toolbar>
        </AppBar>
    );

}

export default NavBar;