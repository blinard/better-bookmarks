import React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';

export default props => (
  <div>
    <NavMenu auth={props.auth} />
    <Container>
      {props.children}
    </Container>
  </div>
);
