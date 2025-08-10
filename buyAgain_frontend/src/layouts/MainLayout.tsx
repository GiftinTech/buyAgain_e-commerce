import React, { Fragment } from 'react';

import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

const MainLayout: React.FC = () => {
  return (
    <Fragment>
      <Header />

      <main>
        <Outlet />
      </main>

      <footer>
        <Footer />
      </footer>
    </Fragment>
  );
};

export default MainLayout;
