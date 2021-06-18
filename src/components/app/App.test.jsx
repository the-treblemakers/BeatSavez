  
/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App component', () => {
    it('renders App', () => {
        render(<App />);

        screen.getByText('Download');
    })
})