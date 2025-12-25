import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    position: fixed;
    top: 5px;
    left: 252px;
    width: 100%;
    box-sizing:border-box;
    border:2px solid grey;
    background:white ;
    
    height: 65px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem; /* Adjust padding for better spacing */
    z-index: 12;
    
    
`;

export const NavLink = styled(Link)`
    color: black !important;
    text-decoration: none;
    
    padding-left:  50px; /* Adjust padding for spacing */
    
    
    min-width: 100px;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
    &.active {
        color: #000000;
    }
`;

export const Bars = styled(FaBars)`
    display: none;
    color: #808080;
    @media screen and (max-width: 768px) {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(-100%, 75%);
        font-size: 1.8rem;
        cursor: pointer;
    }
`;

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    margin-right: 1rem;
    padding-left: 60px;
    padding-bottom: 10px; /* Add padding to the bottom */
    @media screen and (max-width: 768px) {
        display: none;
    }
`;

export const NavBtnLink = styled(Link)`
    border-radius: 4px;
    background: #808080;
    padding: 10px 22px;
    color: #808080;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    margin-left: 1rem; /* Adjust margin for spacing */
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #fff;
        color: #808080;
    }
`;
