import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Text, Breadcrumbs, Anchor } from '@mantine/core';
import { IconHome} from '@tabler/icons-react';

const API_URL = "https://matchchase.onrender.com/api/clubs";

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNations, setExpandedNations] = useState({});


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError('');
    
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load clubs');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setClubs(data);
        } else {
          setClubs([]);
        }
      })
      .catch(err => {
        console.error('Error fetching clubs:', err);
        setError('Failed to load clubs');
      })
      .finally(() => setLoading(false));
  };

  // Helper to get the ID of the latest season
  const getLatestClubSeason = (club) => {
    // The backend already sorted these and gave us only 1 (the latest)
    if (club.clubSeasons && club.clubSeasons.length > 0) {
      return club.clubSeasons[0];
    }
    return null;
  };

  // Group clubs by Nation
  const groupedClubs = useMemo(() => {
    const groups = {};
    clubs.forEach(club => {
      const nationName = club.nation?.name || 'Diğer'; // Fallback if no nation
      if (!groups[nationName]) {
        groups[nationName] = [];
      }
      groups[nationName].push(club);
    });
    return groups;
  }, [clubs]);

  // Get sorted nation names for display order
  const sortedNations = useMemo(() => {
    return Object.keys(groupedClubs).sort();
  }, [groupedClubs]);

  // Toggle function for expanding/collapsing
  const toggleNation = (nationName) => {
    setExpandedNations(prev => ({
      ...prev,
      [nationName]: !prev[nationName]
    }));
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <Container py = "xl">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to="/">
          <IconHome size={16} /> Ana Sayfa
        </Anchor>
        <Text>Takımlar</Text>
      </Breadcrumbs>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Takımlar</h1>
      <div>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
          {clubs.length === 0 ? (
            <p>Mevcut takım bulunamadı.</p>
          ) : (
            <div>
              {sortedNations.map(nationName => {
                const isExpanded = !!expandedNations[nationName];
                const clubCount = groupedClubs[nationName].length;
                return (
                  <div key={nationName} style={{ marginBottom: '15px' }}>
                    {/* Clickable Header */}
                    <div 
                      onClick={() => toggleNation(nationName)}
                      style={{ 
                        borderBottom: '1px solid #eee', 
                        padding: '15px', 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background-color 0.2s',
                        userSelect: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ margin: 0, color: '#34495e', fontSize: '20px' }}>
                          {nationName}
                        </h2>
                        <span style={{ 
                          backgroundColor: '#e0e0e0', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          color: '#555' 
                        }}>
                          {clubCount}
                        </span>
                      </div>
                      <span style={{ fontSize: '18px', color: '#7f8c8d', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                        ▼
                      </span>
                    </div>
                    
                    {/* Collapsible Grid */}
                    {isExpanded && (
                      <div style={{ 
                        display: 'grid', 
                        gap: '20px', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        marginTop: '20px',
                        padding: '10px'
                      }}>
                        {groupedClubs[nationName].map(club => {
                          const latestSeason = getLatestClubSeason(club);
                          const isClickable = !!latestSeason;
                          
                          const CardContent = (
                            <div style={{ 
                              border: '1px solid #ddd', 
                              borderRadius: '8px', 
                              padding: '20px', 
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              cursor: isClickable ? 'pointer' : 'default',
                              height: '100%',
                              opacity: isClickable ? 1 : 0.7
                            }}
                            onMouseEnter={(e) => {
                              if(isClickable) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if(isClickable) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                              }
                            }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                  <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                                    {club.name}
                                  </h3>
                                </div>
                                
                                {isClickable && (
                                  <div style={{ color: '#bdc3c7', fontSize: '20px' }}>›</div>
                                )}
                                {!isClickable && (
                                    <div style={{ color: '#e74c3c', fontSize: '12px', fontWeight: 'bold' }}>Sezon Yok</div>
                                )}
                              </div>
                            </div>
                          );
  
                          return isClickable ? (
                            <Link 
                              key={club.id}
                              to={`/club/${latestSeason.id}`}
                              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                            >
                              {CardContent}
                            </Link>
                          ) : (
                            <div key={club.id} style={{ display: 'block' }}>
                              {CardContent}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}