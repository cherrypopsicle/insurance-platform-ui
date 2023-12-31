import React from 'react';
import { Flex, Box, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link'; // Import Next.js Link component
import UniDawg from '../../public/unidawg.png';

const NavBar = () => {
    return (
        <Flex bg="blue.800" color="white" justifyContent="space-between" alignItems="center" p="4">
            <Box fontSize="48px" fontWeight="bold">
            <img src="/unidawg.png" alt="Logo" style={{ width: '48px', height: '48px' }} />
            </Box>
            <Flex>
                {/* Use Next.js Link for client-side navigation */}
                <NextLink href="/policy-owners" passHref>
                    <Link p="4" fontSize="16px" _hover={{ textDecoration: 'none', bg: 'blue.700' }}>
                        Policy Owners
                    </Link>
                </NextLink>
                <NextLink href="/policy-creators" passHref>
                    <Link p="4"  fontSize="16px" _hover={{ textDecoration: 'none', bg: 'blue.700' }}>
                        Policy Creators
                    </Link>
                </NextLink>
            </Flex>
        </Flex>
    );
};

export default NavBar;
