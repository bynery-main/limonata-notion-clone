import React, { useState } from 'react';
import Image from 'next/image';
import './Reviews.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Review {
  id: number;
  percentage: string;
  tagline: string;
  quote: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
}

const Reviews = () => {
  const reviews: Review[] = [
    {
      id: 1,
      percentage: '400%',
      tagline: 'more productive',
      quote: 'Thanks to Limonata, my grades are fucking amazing, im going to harvard omg',
      author: {
        name: 'Roco Fernandez Pagella',
        title: 'Grad Student at Hardvard',
        image: '/avatars/avatar2.jpg',
      },
    },
    {
      id: 2,
      percentage: '300%',
      tagline: 'faster workflow',
      quote: 'This tool completely transformed how I work. Saved me countless hours!',
      author: {
        name: 'Sarah Johnson',
        title: 'Software Engineer',
        image: '/avatars/avatar1.jpg',
      },
    },
    {
      id: 3,
      percentage: '250%',
      tagline: 'better results',
      quote: 'I never thought I could achieve this level of productivity. Game changer!',
      author: {
        name: 'Michael Chen',
        title: 'Product Manager',
        image: '/avatars/avatar3.jpg',
      },
    },
    {
      id: 4,
      percentage: '350%',
      tagline: 'increased efficiency',
      quote: 'Limonata has revolutionized my workflow. I can focus on what matters most.',
      author: {
        name: 'Jessica Williams',
        title: 'Marketing Director',
        image: '/avatars/avatar4.jpg',
      },
    },
  ];

  const [currentReview, setCurrentReview] = useState(0);

  const nextReview = () => {
    setCurrentReview((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        <div className="review-card">
          <div className="review-content">
            <div className="review-stats">
              <h2 className="percentage">{reviews[currentReview].percentage}</h2>
              <p className="tagline">{reviews[currentReview].tagline}</p>
            </div>
            <p className="review-quote">{reviews[currentReview].quote}</p>
            <div className="review-author">
              <div className="author-image">
                <Image 
                  src={reviews[currentReview].author.image} 
                  alt={reviews[currentReview].author.name}
                  width={50}
                  height={50}
                />
              </div>
              <div className="author-info">
                <h4 className="author-name">{reviews[currentReview].author.name}</h4>
                <p className="author-title">{reviews[currentReview].author.title}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="review-controls">
          <button className="control-btn prev" onClick={prevReview}>
            <FaChevronLeft />
          </button>
          <button className="control-btn next" onClick={nextReview}>
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Reviews;