import { useEffect, useState } from 'react';
import Card from './Card';
import Modal from './Modal'; 
import styles from "@/styles/DisplayData.module.css";
import Form from '@/components/Form';

const DisplayData = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [selectedPortfolios, setSelectedPortfolios] = useState([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});

  
  const fetchPortfolios = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/portofolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      const data = await response.json();
      setPortfolios(data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
  };

  useEffect(() => {
    
    const savedMode = localStorage.getItem('isEditingMode');
    if (savedMode !== null) {
      setIsEditingMode(JSON.parse(savedMode));
    }

    fetchPortfolios();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCreate = () => {
    setShowCreateForm(!showCreateForm);
  };

  const handleSubmitForm = async (formData) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/portofolio', {
        method: 'POST',
        body: formData, 
      });

      if (res.ok) {
        const newPortfolio = await res.json();
        setPortfolios(prevPortfolios => [...prevPortfolios, newPortfolio]);
        setShowCreateForm(false);
        await retryImageFetch(newPortfolio.imageId);
        console.log(newPortfolio.imageId);

      } else {
        console.error('Failed to create portfolio');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };


  const retryImageFetch = async (imageId) => {
   

    
      
        const imageResponse = await fetch(`http://localhost:3000/api/portofolio/${imageId}/image`);
        window.location.reload();

        if (imageResponse.ok) {
          return;
        }
      
      
    

    
  };

  const handleCheckboxChange = (id) => {
    setSelectedPortfolios(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(portfolioId => portfolioId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPortfolios(prevSelected => 
      checkedAll
        ? []
        : portfolios.map(portfolio => portfolio._id)
    );
    setCheckedAll(prevCheckedAll => !prevCheckedAll);
  };

  const handleDelete = async () => {
    try {
      for (const id of selectedPortfolios) {
        await fetch(`http://localhost:3000/api/portofolio/${id}`, {
          method: 'DELETE',
        });
      }
      setPortfolios(prevPortfolios => 
        prevPortfolios.filter(portfolio => !selectedPortfolios.includes(portfolio._id))
      );
      setSelectedPortfolios([]);
      setCheckedAll(false);
    } catch (error) {
      console.error('Error deleting portfolios:', error);
    }
  };

  const handleCardClick = (portfolio) => {
    setSelectedCard(portfolio);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const handleSave = async (id, updatedData) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/portofolio/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
        
      });
  
      if (response.ok) {
        const updatedPortfolio = await response.json();
        console.log('Updated Portfolio:', updatedPortfolio);
  
        setPortfolios(prevPortfolios =>
          prevPortfolios.map(portfolio =>
            portfolio._id === id ? updatedPortfolio : portfolio
          )
        );
  
        handleCloseModal();
         window.location.reload();
        if (updatedPortfolio.imageId) {
          await retryImageFetch(updatedPortfolio.imageId);
        } else {
          console.error('No imageId returned for portfolio update');
        }
      } else {
        console.error('Failed to update portfolio');
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPortfolios = portfolios.filter((portfolio) => {
    const title = portfolio.title || '';
    const matchesSearchQuery = title.toLowerCase().includes(searchQuery.toLowerCase());

    if (isEditingMode) {
      return matchesSearchQuery;
    } else {
      return matchesSearchQuery && portfolio.isVisible;
    }
  });

  const handleImageLoad = (id) => {
    setImageLoaded(prevState => ({ ...prevState, [id]: true }));
  };

  const handleImageError = (id) => {
    setImageLoaded(prevState => ({ ...prevState, [id]: false }));
  };

  const toggleMode = (mode) => {
    setIsEditingMode(mode);
    localStorage.setItem('isEditingMode', JSON.stringify(mode));
  };

  return (
    <div className={styles['global']}>
      <div className={styles['search-bar']}>
        <div className={styles['left-section']}>
          {isEditingMode && (
            <input
              type="checkbox"
              checked={checkedAll}
              onChange={handleSelectAll}
            />
          )}
        </div>
        <div className={styles['right-section']}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {isEditingMode && (
            <>
              <button onClick={handleCreate} className={styles['icon-button']}>
                <img src="/icons/add.png" alt="Create" />
              </button>
              <button onClick={handleDelete} className={styles['icon-button']} disabled={selectedPortfolios.length === 0}>
                <img src="/icons/trashcan.png" alt="Delete" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles['mode-buttons']}>
        <button onClick={() => toggleMode(false)}>Visualization Mode</button>
        <button onClick={() => toggleMode(true)} className={styles['editing-button']}>Editing Mode</button>
      </div>

      {loading && <div>Loading...</div>}

      {showCreateForm && (
        <Form onClose={() => setShowCreateForm(false)} onSubmit={handleSubmitForm} />
      )}

      

      <div className={styles['card-container']}>
        {filteredPortfolios.map((portfolio) => (
          imageLoaded[portfolio._id] ? (
            <Card
              key={portfolio._id}
              id={portfolio._id}
              checked={selectedPortfolios.includes(portfolio._id)}
              onChange={() => handleCheckboxChange(portfolio._id)}
              onClick={() => handleCardClick(portfolio)}
              title={portfolio.title}
              description={portfolio.description}
              imageUrl={`http://localhost:3000/api/portofolio/${portfolio.imageId}/image`}
              clientLink={portfolio.clientLink}
              showCheckbox={isEditingMode}
              onImageLoad={() => handleImageLoad(portfolio._id)}
              onImageError={() => handleImageError(portfolio._id)}
            />
          ) : (
            <img
              key={portfolio._id}
              src={`http://localhost:3000/api/portofolio/${portfolio.imageId}/image`}
              style={{ display: 'none' }}
              onLoad={() => handleImageLoad(portfolio._id)}
              onError={() => handleImageError(portfolio._id)}
              alt="loading"
            />
          )
        ))}
      </div>

      {selectedCard && (
        <Modal
          isOpen={!!selectedCard}
          onClose={handleCloseModal}
          id={selectedCard._id}
          title={selectedCard.title}
          imageUrl={`http://localhost:3000/api/portofolio/${selectedCard.imageId}/image`}
          description={selectedCard.description}
          clientLink={selectedCard.clientLink}
          onSave={handleSave}
          isEditingMode={isEditingMode}
        />
      )}
    </div>
  );
};

export default DisplayData;
