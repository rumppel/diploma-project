import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ubbIcon from '../assets/icons/dobroua.png'; // Import your png icon
import savelifeIcon from '../assets/icons/comebackalive.svg'; // Import your svg icon
import razomIcon from '../assets/icons/razom.png'; // Import your webp icon
import novaIcon from '../assets/icons/nova.webp'; // Import your png icon

const HowToHelp = () => {
  const funds = [
    {
      name: "Ukrainian Philanthropic Marketplace",
      description: "Fundraising for medical aid and humanitarian projects. The fund actively supports hospitals, provides medical supplies, and runs humanitarian projects to support civilians affected by the conflict.",
      link: "https://ubb.org.ua/",
      icon: ubbIcon,
    },
    {
      name: "Come Back Alive",
      description: "Support for the Ukrainian army and humanitarian aid to civilians. The fund provides equipment and training to the military, as well as direct support to affected families.",
      link: "https://savelife.in.ua/",
      icon: savelifeIcon,
    },
    {
      name: "Razom",
      description: "Humanitarian aid and support for reforms in Ukraine. The organization focuses on advocacy, supporting local NGOs, and providing emergency relief to those in need.",
      link: "https://www.razomforukraine.org/",
      icon: razomIcon,
    },
    {
      name: "Nova Ukraine",
      description: "Aid to refugees and those affected by the war. Nova Ukraine provides essential supplies, healthcare, and psychological support to displaced persons and vulnerable communities.",
      link: "https://novaukraine.org/",
      icon: novaIcon,
    },
  ];

  return (
    <Container className="page-content mt-5">
      <Row className="mt-3 mb-2">
        <Col>
          <h1 className='hth-h1'>How to help</h1>
          <p>Support funds that are raising money to help civilians in Ukraine:</p>
        </Col>
      </Row>
      <Row>
        {funds.map((fund, index) => (
          <Col xs={12} sm={6} md={6} lg={6} xl={6} key={index} className="mb-4">
            <Card className="h-100 hth-card">
              <Card.Body className="d-flex flex-column">
              <img src={fund.icon} alt={fund.name} className="mb-2" style={{ height: '50px', width: 'auto', alignSelf: 'center' }} />
                
                <Card.Title>{fund.name}</Card.Title>
                <Card.Text>{fund.description}</Card.Text>
                <Card.Link href={fund.link} target="_blank" className="mt-auto">    
                  Learn more
                </Card.Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default HowToHelp;