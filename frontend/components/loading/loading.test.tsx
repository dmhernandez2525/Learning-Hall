import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from './loading';

describe('Loader', () => {
  it('renders the loader component', () => {
    const { container } = render(<Loader />);
    const wrapper = container.querySelector('.Og-raper');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders the wrapper div', () => {
    const { container } = render(<Loader />);
    const wrapper = container.querySelector('.wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders the box-wrap container', () => {
    const { container } = render(<Loader />);
    const boxWrap = container.querySelector('.box-wrap');
    expect(boxWrap).toBeInTheDocument();
  });

  it('renders all six box elements', () => {
    const { container } = render(<Loader />);

    const boxOne = container.querySelector('.box.one');
    const boxTwo = container.querySelector('.box.two');
    const boxThree = container.querySelector('.box.three');
    const boxFour = container.querySelector('.box.four');
    const boxFive = container.querySelector('.box.five');
    const boxSix = container.querySelector('.box.six');

    expect(boxOne).toBeInTheDocument();
    expect(boxTwo).toBeInTheDocument();
    expect(boxThree).toBeInTheDocument();
    expect(boxFour).toBeInTheDocument();
    expect(boxFive).toBeInTheDocument();
    expect(boxSix).toBeInTheDocument();
  });

  it('renders exactly 6 box elements', () => {
    const { container } = render(<Loader />);
    const boxes = container.querySelectorAll('.box');
    expect(boxes).toHaveLength(6);
  });
});
