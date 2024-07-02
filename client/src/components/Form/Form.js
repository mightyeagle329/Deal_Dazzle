import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Paper } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import FileBase from 'react-file-base64';
import { useHistory } from 'react-router-dom';
import useStyles from './styles';
import jwtDecode from 'jwt-decode';

import { createPost, updatePost } from '../../actions/posts';

const Form = ({ currentId, setCurrentId }) => {
  const [postData, setPostData] = useState({ title: '', message: '', tags: [], price: '', selectedFile: '' });
  const post = useSelector((state) => (currentId ? state.posts.posts.find((message) => message._id === currentId) : null));
  const dispatch = useDispatch();
  const classes = useStyles();
  const user = JSON.parse(localStorage.getItem('profile'));
  const history = useHistory();
  let decodedToken = jwtDecode(user?.token);
  let userID;
  const googleId = decodedToken?.sub;

  if (googleId) {
    userID = googleId;
  } else {
    userID = user?.result?._id;
  }

  const clear = () => {
    setCurrentId(0);
    setPostData({ title: '', message: '', tags: [], price: '', selectedFile: '' });
  };

  useEffect(() => {
    if (!post?.title) clear();
    if (post) setPostData(post);
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentId === 0) {
      dispatch(createPost({ ...postData, name: user?.result?.name, userID }, history));
      clear();
    } else {
      dispatch(updatePost(currentId, { ...postData, name: user?.result?.name, userID }));
      clear();
    }
  };

  if (!user?.result?.name) {
    return (
      <Paper className={classes.paper} elevation={6}>
        <Typography variant="h6" align="center">
          Please Sign In to Like and Comment on deals!
        </Typography>
      </Paper>
    );
  }

  const handleTagChange = (e) => {
    // Split the input value by commas and trim each tag
    const tagsArray = e.target.value.split(',').map(tag => tag.trim());
    setPostData({ ...postData, tags: tagsArray });
  };

  return (
    <Paper className={classes.paper} elevation={6}>
      <form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={handleSubmit}>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>{currentId ? `Editing "${post?.title}"` : 'Create a Deal'}</Typography>
        <TextField name="title" variant="outlined" label="Title" fullWidth value={postData.title} onChange={(e) => setPostData({ ...postData, title: e.target.value })} />
        <TextField name="message" variant="outlined" label="Message" fullWidth multiline rows={4} value={postData.message} onChange={(e) => setPostData({ ...postData, message: e.target.value })} />
        <TextField name="tags" variant="outlined" label="Location" fullWidth value={postData.tags.join(',')} onChange={handleTagChange} />
        <TextField name="price" variant="outlined" label="Price" fullWidth value={postData.price} onChange={(e) => setPostData({ ...postData, price: e.target.value })} />
        <div className={classes.fileInput}><FileBase type="file" multiple={false} onDone={({ base64 }) => setPostData({ ...postData, selectedFile: base64 })} /></div>
        <Button className={classes.buttonSubmit} variant="contained" color="primary" size="large" type="submit" fullWidth>Submit</Button>
        <Button className={classes.buttonClear} variant="contained" color="secondary" size="small" onClick={clear} fullWidth>Clear</Button>
      </form>
    </Paper>
  );
};

export default Form;