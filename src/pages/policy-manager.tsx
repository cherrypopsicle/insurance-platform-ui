import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import usePolicyContract from '@/hooks/usePolicyContract';
import {BigNumber, ethers} from "ethers";
import {useMetaMask} from "@/contexts/MetaMaskContext";
import {
    Flex,
    Box,
    Text,
    Divider,
    VStack,
    Heading,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Grid,
    Icon,
    Modal,
    ModalContent,
    ModalOverlay,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Input,
    Button
} from '@chakra-ui/react';
import {FaEthereum} from "react-icons/fa";
import PayPremiumCTA from "@/components/PayPremiumCTA";
import {convertEpochToReadableDate} from '@/utils/helpers'; // Import the helper function
import usePayoutContract from '@/hooks/usePayoutContract';

const PolicyManager = () => {
    const router = useRouter();
    const {policyId} = router.query;
    const {fetchPolicy, payPremium, calculatePremium, handlePayout, fetchPremiumsPaid, fetchLastPaidTime, fetchTotalCoverage, fetchPotentialCoverage} = usePolicyContract();
    const {account} = useMetaMask();
    const [policy, setPolicy] = useState(null);
    const [potentialCoverage, setPotentialCoverage] = useState<string>("0.0");
    const [calculatedPremium, setCalculatedPremium] = useState<BigNumber>(BigNumber.from(0));
    const [premiumsPaid, setPremiumsPaid] = useState<BigNumber>(BigNumber.from(0));
    const [lastPaidTime, setLastPaidTime] = useState<BigNumber>(BigNumber.from(0));
    const [totalCoverage, setTotalCoverage] = useState<BigNumber>(BigNumber.from(0));
    const [premiumAmountToSend, setPremiumAmountToSend] = useState<BigNumber>(BigNumber.from(0));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    useEffect(() => {
        const loadData = async () => {
            if (policyId && account) {
                // Load policy data 
                const policyDetails: any = await fetchPolicy(policyId, account);
                setPolicy(policyDetails);

                // load premium data
                const calcPremium: BigNumber = await calculatePremium(policyId);
                setCalculatedPremium(calcPremium);
                setPremiumAmountToSend(calcPremium);

                const premiumsPaid: BigNumber = await fetchPremiumsPaid(policyId, account);
                setPremiumsPaid(premiumsPaid);

                const lastPaidTime: BigNumber = await fetchLastPaidTime(policyId, account);
                setLastPaidTime(lastPaidTime);

                const coverage: BigNumber = await fetchTotalCoverage(policyId, account);
                setTotalCoverage(coverage);
            }
        };

        loadData();
    }, [policyId, account, fetchPolicy, calculatePremium, fetchPremiumsPaid, fetchTotalCoverage, fetchLastPaidTime]);

    const handlePayPremium = async (id: any, amount: BigNumber) => {
        console.log(amount);
        await payPremium(id, amount);
    };

    const handleClaim = async (id: any) => {
        await handlePayout(id, totalCoverage);
    };

    const checkPotentialCoverage = async (id: any, amount: BigNumber) => {
        const _potentialCoverage = await fetchPotentialCoverage(id, account, amount);
        setPotentialCoverage(ethers.utils.formatEther(_potentialCoverage));
    }

    const handlePremiumInput = async (e: any) => {
        const inputAmount = ethers.utils.parseEther(e.target.value || '0');
        if (inputAmount.gte(calculatedPremium)) {
            setPremiumAmountToSend(inputAmount);
            await checkPotentialCoverage(policyId, inputAmount);
        } else {
            setPremiumAmountToSend(calculatedPremium)
        }
    };

    return (
        <Flex
            width="100vw"
            justifyContent="center"
            p={4}
            overflow="auto"
            align="start"
            height="auto"
            mt={10}
        >
            {policy ? (
                <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    p={6}
                    width="80%"
                    maxWidth="1000px"
                    bg="white"
                    boxShadow="lg"
                >
                    <Flex justify="space-between" align="center">
                        <Heading as="h1" size="xl">Policy Manager</Heading>
                        <StatGroup>
                            <Stat>
                                <StatLabel>ID</StatLabel>
                                <StatNumber>{policy.id}</StatNumber>
                            </Stat>
                        </StatGroup>
                    </Flex>
                    <Divider my={4}/>
                    <Grid templateColumns={{sm: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)'}} gap={6}>
                        <Stat>
                            <StatLabel>Coverage Amount</StatLabel>
                            <StatNumber>{ethers.utils.formatEther(policy.coverageAmount)} <Icon as={FaEthereum}
                                                                                                color="currentcolor"/></StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Initial Premium Fee</StatLabel>
                            <StatNumber>{ethers.utils.formatEther(policy.initialPremiumFee)} <Icon as={FaEthereum}
                                                                                                   color="currentcolor"/></StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Initial Coverage Percentage</StatLabel>
                            <StatNumber>{policy.initialCoveragePercentage}%</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Premium Rate</StatLabel>
                            <StatNumber>{ethers.utils.formatEther(policy.premiumRate)} <Icon as={FaEthereum} ml={1}
                                                                                             color="currentcolor"/></StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Duration</StatLabel>
                            <StatNumber>{policy.duration} days</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Penalty Rate</StatLabel>
                            <StatNumber>{policy.penaltyRate}%</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Months Grace Period</StatLabel>
                            <StatNumber>{policy.monthsGracePeriod}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Calculated Premium</StatLabel>
                            <StatNumber>{calculatedPremium ? ethers.utils.formatEther(calculatedPremium) : '0.0'}<Icon
                                as={FaEthereum} color="currentcolor"/></StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel> Premiums Paid </StatLabel>
                            <StatNumber>{premiumsPaid ? ethers.utils.formatEther(premiumsPaid) : '0.0'}<Icon
                                as={FaEthereum} color="currentcolor"/></StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel> Last Paid time </StatLabel>
                            <StatNumber>{lastPaidTime ? convertEpochToReadableDate(lastPaidTime) : '0.0'}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel> Total Coverage </StatLabel>
                            <StatNumber>{totalCoverage ? ethers.utils.formatEther(totalCoverage) : '0.0'}<Icon
                                as={FaEthereum} color="currentcolor"/></StatNumber>
                        </Stat>
                    </Grid>
                    <Divider my={4}/>
                    <Flex justifyContent="space-between">
                        <Button colorScheme="blue" onClick={openModal}>Pay Premium</Button>
                        <Button colorScheme="teal" onClick={() => handleClaim(policyId)}>Claim</Button>
                    </Flex>
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                        <ModalOverlay/>
                        <ModalContent>
                            <ModalHeader>Pay Premium</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody>
                                <form>
                                    {premiumAmountToSend != null && (
                                        <>
                                            <Input
                                                placeholder="Premium amount"
                                                defaultValue={ethers.utils.formatEther(calculatedPremium)}
                                                onChange={handlePremiumInput}
                                                type="number" // Ensure input is treated as a numerical value
                                                min={ethers.utils.formatEther(calculatedPremium)} // Set the minimum value to the calculated premium
                                            />
                                            <Stat>
                                                <StatLabel> Potential Coverage </StatLabel>
                                                <StatNumber>{potentialCoverage ? potentialCoverage : '0.0'}
                                                    <Icon
                                                        as={FaEthereum} color="currentcolor"/>
                                                </StatNumber>
                                            </Stat>
                                            <PayPremiumCTA
                                                premiumAmountToSend={ethers.utils.formatEther(premiumAmountToSend)}
                                                onPayPremium={handlePayPremium}
                                                policyId={policyId}
                                            />
                                        </>
                                    )}
                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme="blue" mr={3} onClick={closeModal}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </Box>
            ) : (
                <Text>Loading policy details...</Text>
            )}
        </Flex>
    );
};

export default PolicyManager;
