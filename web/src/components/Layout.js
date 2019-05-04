import React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';

export default props => (
  <div>
    <NavMenu />
    <Container fluid={true}>
      {props.children}
    </Container>
  </div>
);
