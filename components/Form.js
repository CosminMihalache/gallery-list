
import { useState } from 'react';
import styles from '@/styles/Modal.module.css'; 

const Form = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null, 
    clientLink: '',
    isVisible: false,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData((prevData) => ({
        ...prevData,
        image: files[0], 
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('description', formData.description);
    if (formData.image) {
      formDataToSubmit.append('image', formData.image); 
    }
    formDataToSubmit.append('clientLink', formData.clientLink);
    formDataToSubmit.append('isVisible', formData.isVisible);

    await onSubmit(formDataToSubmit); 
    onClose(); 
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>X</button>
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
            />
          </label>
          <label>
            Image:
            <input
              type="file"
              name="image"
              onChange={handleChange}
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            ></textarea>
          </label>
          <label>
            Client Link:
            <input
              type="text"
              name="clientLink"
              value={formData.clientLink}
              onChange={handleChange}
              placeholder="Client Link"
            />
          </label>
          <label>
            <input
              type="checkbox"
              name="isVisible"
              checked={formData.isVisible}
              onChange={() => setFormData((prevData) => ({ ...prevData, isVisible: !prevData.isVisible }))}
            /> Visible
          </label>
          <button type="submit">Add Portfolio Item</button>
        </form>
      </div>
    </div>
  );
};

export default Form;
