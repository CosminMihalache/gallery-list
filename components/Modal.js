import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css'; 

const Modal = ({ isOpen, onClose, title, imageUrl, description, clientLink, id, onSave, isEditingMode, isVisible }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: title || '', 
    imageUrl: imageUrl || '', 
    description: description || '', 
    clientLink: clientLink || '', 
  });
  const [visible, setVisible] = useState(isVisible ?? true); 
  const [imageFile, setImageFile] = useState(null); 

  useEffect(() => {
    setFormData({
      title: title || '',
      imageUrl: imageUrl || '',
      description: description || '',
      clientLink: clientLink || ''
    });
    setVisible(isVisible ?? true); 
  }, [title, imageUrl, description, clientLink, isVisible]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'auto'; 
    }

    
    return () => {
      document.body.style.overflow = 'auto'; 
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEditClick = () => {
    if (isEditingMode) {
      setIsEditing(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleVisibilityChange = (e) => {
    setVisible(e.target.checked);
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const updatedData = { ...formData, isVisible: visible };
      const formDataToSend = new FormData();
      
      
      for (const key in updatedData) {
        if (Object.prototype.hasOwnProperty.call(updatedData, key)) {
          formDataToSend.append(key, updatedData[key]);
        }
      }

      
      if (imageFile) {
        console.log(imageFile)
        formDataToSend.append('image', imageFile);
      }

      
      const response = await fetch(`http://localhost:3000/api/portofolio/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        onSave(id, { ...updatedData, imageUrl: response.url });
        setIsEditing(false);
      } else {
        console.error('Failed to update portfolio');
      }
    } catch (error) {
      console.error('Error updating portfolio:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: title || '',
      imageUrl: imageUrl || '',
      description: description || '',
      clientLink: clientLink || ''
    });
    setVisible(isVisible ?? true); 
    setImageFile(null); 
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        {!isEditing ? (
          <>
            <img className={styles.modalImage} src={formData.imageUrl} alt={formData.title} />
            <h2 className={styles.modalTitle}>{formData.title}</h2>
            <p className={styles.modalDescription}>{formData.description}</p>
            {formData.clientLink && <a href={formData.clientLink} className={styles["link"]} target="_blank" rel="noopener noreferrer">Visit Link</a>}
            {isEditingMode && (
              <button className={styles.editButton} onClick={handleEditClick}>Edit</button>
            )}
          </>
        ) : (
          <div className={styles.editForm}>
            <label>
              Title:
              <input type="text" name="title" value={formData.title} onChange={handleChange} />
            </label>
            <label>
              Image URL:
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
            </label>
            <label>
              New Image:
              <input type="file" name="image" onChange={handleFileChange} />
            </label>
            <label>
              Description:
              <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
            </label>
            <label>
              Client Link:
              <input type="text" name="clientLink" value={formData.clientLink} onChange={handleChange} />
            </label>
            <label>
              Visible:
              <input type="checkbox" checked={visible} onChange={handleVisibilityChange} />
            </label>
            <button onClick={handleSave}>Save</button>
            <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
