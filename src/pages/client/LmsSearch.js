import React, { Component, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';
import {useHistory, useParams, useLocation, Link} from 'react-router-dom';
import Grid from '../../fhg/components/Grid';
import clsx from 'clsx';
import usePageTitle from '../../fhg/hooks/usePageTitle';
import axios from 'axios'
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme) => ({
      root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '50px',
        margin: theme.spacing(2, 3, 0 , 3),
      },
      resultFound: {
            width:'100%',
            // maxHeight: `calc(100% - ${theme.spacing(5)}px)`,
            height: '100%',
            // overflowY: 'auto',
            margin: theme.spacing(1,0),
            backgroundColor: theme.palette.background.paper,
      },
      jumbotron: {
            backgroundColor: '#fff',
            borderRadius: '4px',
            boxShadow: '0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%), 0 3px 1px -2px rgb(0 0 0 / 20%)',
            color: 'rgba(0,0,0,.87)',
            marginBottom: '3rem',
            padding: '3rem 2rem'
      },
      decription:{
            maxHeight: '40px',
            // overflow: 'hidden',
            // whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
      },
      singleResult: {
            width:'95%',
            cursor: 'pointer',
            margin: '10px auto',
            padding: theme.spacing(1, 2),
            boxShadow: '0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%), 0 3px 1px -2px rgb(0 0 0 / 20%)',
            maxHeight: '200px',
            backgroundColor: theme.palette.background.paper,
            // border: '1px solid rgb(107,146,65)',
            borderRadius: '0',
      },
      text: {
            padding: theme.spacing(1, 0, 0 , 2),
      },
      name:{
            // padding: theme.spacing(1, 0, 0 , 2),
            fontSize: '20px',
            '&:hover': {
                  textDecoration: 'underline',
                  color: '#527928'
            }
      },
      textCenter: {
            textAlign: 'center'
      },
      listRoot: {
            width: '100%',
            maxHeight: `calc(100% - ${theme.spacing(5)}px)`,
            height: '99vh',
            overflowY: 'auto',
            backgroundColor: theme.palette.background.paper,
      },
      input: {
        marginLeft: theme.spacing(1),
        flex: 1,
      },
      iconButton: {
        padding: 10,
      },
      divider: {
        height: 28,
        margin: 4,
      },
}), {name: 'LmsSearch'});

export default function LmsSearch() {
      const classes = useStyles();
      const { clientId, courseId, unitId} = useParams();
      const history = useHistory();
      const location = useLocation();
      const [search, setSearch] = useState(location.state.search || '')
      const [result, setResult] = useState([])
      const [exact, setExact] = useState(location.state.exact)
      const [loading, setLoading] = useState(true)
      
      usePageTitle({titleKey: 'lms.title.search', type: 'lms'});

      useEffect(() => {
            console.log('search :::::::::::::::', search)
            if(search !== '' && search?.length > 0){
                  handleSubmit(search)
            }
      }, [])
      const handleSearchChange = (e) => {
            const value = e.target.value.trimStart()
            if(value?.length > 0) {
                  setSearch(value)
                  // handleSubmit(value)
            }else{
                  setSearch('')
                  // setResult([])
            }
      }
      const keyPress = (e) => {
            if(e.keyCode == 13){
               e.preventDefault()
               if(search?.length > 0) handleSubmit(search)
            }
      }
      const handleChangeCheck = (e) => {
            setExact(exact => !exact)
      }
      const handleSubmit = (value) => {
            // searching in aws cloud search
            let options = null
            setLoading(true)
            if(exact) {
                  options = {
                        url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/search?q=${value}
                              &q.options=%7Bfields:%5B'course_name%5E5','module_name%5E5','course_keywords','name%5E5','transcript%5E4','course_description','description%5E4'%5D%7D
                              &highlight.course_name=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.course_description=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.course_keywords=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.module_name=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.name=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.description=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.transcript=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &return=_all_fields%2C_score&sort=_score+desc`,
                        headers:{
                              'content-type': 'application/json',
                              'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
                        },
                  };
            }else {
                  options = {
                        url: `https://no3iyr7cae.execute-api.us-east-1.amazonaws.com/beta/search?q=${value}*
                              &q.options=%7Bfields:%5B'course_name%5E5','module_name%5E5','course_keywords','name%5E5','transcript%5E4','course_description','description%5E4'%5D%7D
                              &highlight.course_name=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.course_description=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.course_keywords=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.module_name=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.name=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.description=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &highlight.transcript=%7B%22max_phrases%22%3A3%2C%22format%22%3A%22text%22%2C%22pre_tag%22%3A%22*%22%2C%22post_tag%22%3A%22*%22%7D
                              &return=_all_fields%2C_score&sort=_score+desc`,
                        headers:{
                              'content-type': 'application/json',
                              'x-api-key': "LhOZvNGn1D7FzkzYXvSDz4taXtKaEM393BURjH9M",
                        },
                  };
            }
            axios(options)
                  .then((res) => res.data)
                  .then(async (res) => {
                        // console.log('res ::::::::::::::::::::::', res)
                        console.log('res ::::::::::::::::::::::', res?.hits.hit)
                        const highlights = []
                        let counter = 0
                        const foundData = res?.hits.hit
                        while(counter < foundData?.length){
                              let course_description = await sanitizeData(foundData[counter]?.highlights?.course_description)
                              let course_name = await sanitizeData(foundData[counter]?.highlights?.course_name)
                              let module_name = await sanitizeData(foundData[counter]?.highlights?.module_name)
                              let default_module_name = await sanitizeData(foundData[counter]?.fields?.module_name)
                              let name = await sanitizeData(foundData[counter]?.highlights?.name)
                              let description = await sanitizeData(foundData[counter]?.highlights?.description)
                              let transcript = await sanitizeData(foundData[counter]?.highlights?.transcript)
                              await highlights.push({
                                    course_description,
                                    course_name, 
                                    module_name, 
                                    name, 
                                    description, 
                                    transcript, 
                                    default_module_name, 
                                    course_id: foundData[counter]?.fields?.course_id, 
                                    id: foundData[counter]?.id 
                              })
                              counter += 1
                        }
                        console.log('highlights ::::::::::::::::::::::', highlights)
                        setResult(highlights)
                        setLoading(false)
                  })
                  .catch((err) => {
                        console.log('err ::::::::::::::::::',err)
                        setLoading(false)
                  })
            // end aws CS
      }
      console.log('exact', exact)
      const sanitizeData = (text) => {
            const result = text.replace(/\*(.*?)\*/g, "<b>$1</b>");        
            return result;
      }
  
      const handleClickLink = (link, week = null) => {
            if(week){
               location.state = {week: week};
            }
            location.pathname = link;
            history.push(location);
      };
      return (
            <Grid item container={true} resizable direction={'column'}>
                  <Grid name={'Lms'} container={true} directin={'row'} item className={classes.listRoot} >
                        <Paper component="form" className={classes.root}>
                              <InputBase
                                    className={classes.input}
                                    value={search}
                                    onKeyDown={keyPress}
                                    onChange={handleSearchChange}
                                    placeholder="Search"
                                    inputProps={{ "aria-label": "search course's" }}
                              />
                              {/* <IconButton type="submit" className={classes.iconButton} aria-label="search">
                              <SearchIcon />
                              </IconButton> */}
                              <Divider className={classes.divider} orientation="vertical" />
                                    <FormControlLabel
                                          control={
                                          <Checkbox
                                                checked={exact}
                                                onChange={handleChangeCheck}
                                                name="exact"
                                                color="primary"
                                          />
                                          }
                                          label="Exact Match"
                                    />
                              <Divider className={classes.divider} orientation="vertical" />
                              <IconButton disabled={search?.length > 0 ? false : true } onClick={() => handleSubmit(search)} color="primary" className={classes.iconButton} aria-label="directions">
                                    <SearchIcon />
                              </IconButton>
                        </Paper>

                        <div className={classes.resultFound}>
                              {!loading ? 
                                    result?.length > 0 ?
                                          result?.map((itm, idx) => {
                                                return (
                                                      <>
                                                            <div className={classes.singleResult} onClick={() => handleClickLink(`/client/${clientId}/course/${itm.course_id}/${itm.id}`, itm.default_module_name)}>
                                                                  <p>
                                                                        <span title="Course" className={classes.name} dangerouslySetInnerHTML={{ __html: itm.course_name }} /> 
                                                                              &nbsp; - &nbsp;
                                                                        <span title="Module" className={classes.name} dangerouslySetInnerHTML={{ __html: itm.module_name }} /> 
                                                                              &nbsp; - &nbsp; 
                                                                        <span title="Unit" className={classes.name} dangerouslySetInnerHTML={{ __html: itm.name }} />
                                                                  </p>
                                                                  <p title="Description" className={classes.decription} dangerouslySetInnerHTML={{ __html: itm.description }} /> 
                                                                  <p title="Transcript" >Transcript : <span dangerouslySetInnerHTML={{ __html: itm.transcript }} /> </p>
                                                            </div>
                                                      </>
                                                )
                                          })
                                          :
                                          <p className={classes.textCenter}>No Result Found</p>
                                    :
                                    <p className={classes.textCenter}>Loading...</p>
                              }
                        </div>
                  </Grid>
            </Grid>
      );
}

