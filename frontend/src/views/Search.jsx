import React, { useState } from 'react';
import styled from 'styled-components';
import { SearchTwoTone } from '@mui/icons-material';
import { Category } from '../utils/Data.js';
import { Link } from 'react-router-dom';
import { DefaultCard } from '../components/DefaultCard.jsx';
import { CircularProgress } from '@mui/material';
import { searchPodcast } from '../api/server.js';
import { TopResult } from '../components/TopResult.jsx';
import { MoreResult } from '../components/MoreResult.jsx';
import { toast } from 'sonner';

const SearchMain = styled.div`
  padding: 20px 30px;
  padding-bottom: 200px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 768px) {
    padding: 20px 9px;
  }
`;

const SearchBar = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  border: 1px solid ${({ theme }) => theme.text_secondary};
  border-radius: 30px;
  cursor: pointer;
  padding: 12px 16px;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.text_secondary};
  background-color: ${({ theme }) => theme.bgLight};
  transition: background-color 0.3s, border-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.bg};
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  width: 100%;
  background: inherit;
  color: inherit;
  font-size: 16px;
`;

const Heading = styled.div`
  color: ${({ theme }) => theme.text_primary};
  font-size: 22px;
  font-weight: 540;
  margin: 10px 14px;
`;

const BrowseAll = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 14px;
`;

const SearchedCards = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  padding: 14px;
  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    padding: 6px;
  }
`;

const Categories = styled.div`
  margin: 20px 10px;
`;

const OtherResults = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 700px;
  overflow-y: auto;
  gap: 6px;
  padding: 4px 4px;
  @media (max-width: 768px) {
    max-height: none;
    padding: 4px 0px;
  }
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const DisplayNo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.text_primary};
`;

export const Search = () => {
  const [searched, setSearched] = useState('');
  const [searchedPodcasts, setSearchedPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    setSearchedPodcasts([]);
    setLoading(true);
    setSearched(e.target.value);
    try {
      const res = await searchPodcast(e.target.value);
      setSearchedPodcasts(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err.message);
      toast.error('Fail to search for podcast')
    }
    setLoading(false);
  };

  return (
    <SearchMain>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <SearchBar>
          <SearchTwoTone sx={{ color: 'inherit' }} />
          <SearchInput
            type="text"
            placeholder="Search Artists/Podcasts..."
            value={searched}
            onChange={handleChange}
          />
        </SearchBar>
      </div>
      {searched === '' ? (
        <Categories>
          <Heading>Browse All</Heading>
          <BrowseAll>
            {Category?.map((category) => (
              <Link to={`/podcast/show/${category?.name?.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                <DefaultCard key={category?.name} category={category} />
              </Link>
            ))}
          </BrowseAll>
        </Categories>
      ) : (
        <>
          {loading ? (
            <Loader>
              <CircularProgress />
            </Loader>
          ) : (
            <SearchedCards>
              {searchedPodcasts?.length === 0 ? (
                <DisplayNo>No Podcasts Found</DisplayNo>
              ) : (
                <>
                  <TopResult podcast={searchedPodcasts[0]} />
                  <OtherResults>
                    {searchedPodcasts?.slice(1).map((podcast) => (
                      <MoreResult key={podcast._id} podcast={podcast} />
                    ))}
                  </OtherResults>
                </>
              )}
            </SearchedCards>
          )}
        </>
      )}
    </SearchMain>
  );
};
