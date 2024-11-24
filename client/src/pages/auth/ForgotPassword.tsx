import { useState, useRef, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { Box, Button, Card, Flex, Heading, IconButton, Skeleton, Text, TextField, Tooltip } from '@radix-ui/themes';

import './ForgotPassword.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AnimatedCard = animated(Card);

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(200);

  const [values, setValues] = useState(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // evt custom logik?
  useEffect(() => {
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 250);

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    console.log(cardHeight)
  }, [cardHeight]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        setCardHeight(contentRef.current.clientHeight);
      }
    });
  
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
  
    return () => {
      observer.disconnect();
    };
  }, [step]);

  const transitions = useTransition(step, {
    initial: { opacity: 1, transform: 'translateX(0%)' },
    from: {
      opacity: 0,
      transform: direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)',
    },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    leave: {
      opacity: 0,
      transform: direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)',
    },
    config: { duration: 200 },
  });

  const handleNextStep = () => {
    setDirection('next');
    setStep((prev) => prev + 1);
  };
  
  const handlePreviousStep = () => {
    setDirection('prev');
    setStep((prev) => prev - 1);
  };



  return (
    <Flex align="center" justify="center" height="100vh" width="100vw">
      <Flex justify='center'>
        <AnimatedCard
          asChild
          variant="ghost"
          className={`${cardHeight !== 0 ? 'transition-all duration-200' : ''}`}
          style={{
            boxShadow: 'var(--shadow-5)',
            height: `${cardHeight + 30}px`,
            minWidth: '350px',
            maxWidth: '400px'
          }}>
          <div>
          <Flex gap="3" position="absolute" className='z-10' top="0" right="0" m="3">
            {step > 1 &&
            <>
              <Skeleton loading={isLoading}>
                <Tooltip content="Tilbage">
                  <IconButton
                    tabIndex={step}
                    variant="ghost"
                    color="gray"
                    highContrast
                    onClick={() => handlePreviousStep()}>
                    <FontAwesomeIcon icon={faArrowLeft}/>
                  </IconButton>
                  </Tooltip>
              </Skeleton>
            </>
            }
            <Skeleton loading={isLoading}>
              <Tooltip content="Til forsiden">
                <IconButton
                  tabIndex={step}
                  variant="ghost"
                  color="gray"
                  highContrast
                  onClick={() => navigate("/login")}>
                  <FontAwesomeIcon icon={faXmark}/>
                </IconButton>
              </Tooltip>
            </Skeleton>
					</Flex>
          <form onSubmit={(e) => {
              e.preventDefault();
              handleNextStep();
            }}>
            {transitions((style, currentStep) => (
              <animated.div
                ref={contentRef}
                className="w-full pr-8 pl-2 pt-2"
                style={{
                  ...style,
                  position: 'absolute'
                }}>
                {currentStep === 1 && (
                  <Box>
                    <Heading mb="1">
                      <Skeleton loading={isLoading}>Nulstil din adgangskode</Skeleton>
                    </Heading>
                    <Text color="gray" size="2">
                      <Skeleton loading={isLoading}> 
                        Indtast email adressen som er associeret med din konto og vi vil sende dig
                        bekræftelse på email.
                      </Skeleton>
                    </Text>
                    <Flex mt="5" direction="column">
                      <Text as="label" size="2" weight="medium" mb="2" htmlFor="password">
                        <Skeleton loading={isLoading}>Email</Skeleton>
                      </Text>
                      <Skeleton loading={isLoading}>
                        <TextField.Root
                          id="password"
                          variant="soft"
                          type="email"
                          color="gray"
                          placeholder="Din email adresse"/>
                      </Skeleton>
                      <Flex mt="1rem" width="100%" justify="center" gap="3">
                        <Skeleton loading={isLoading}>
                          <Button
                            className="w-full cursor-pointer"
                            variant="solid"
                            type="submit"
                            onClick={() => handleNextStep()}>
                            Send kode
                          </Button>
                        </Skeleton>
                      </Flex>
                    </Flex>
                  </Box>
                )}

                {currentStep === 2 && (
                  <Box>
                    <Heading mb='1'>Kode afsendt!</Heading>
                      <Text color="gray" size="2">
                        Skriv den 6 cifret kode som du har modtaget på den angivet email adresse!
                      </Text>
                    <Flex mt="5" direction="row" gap="2" justify="center">
                      {values.map((value, index) => (
                        <TextField.Root
                          key={index}
                          className='email-code-txt text-center border dark:border-gray5'
                          variant="soft"
                          color='gray'
                          size="3"
                          style={{
                            width: "50px"
                          }}
                          ref={(el) => (inputRefs.current[index] = el)}
                          value={value}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          maxLength={1}
                          inputMode="numeric"
                          type="text">
                      </TextField.Root>
                      ))}
                  </Flex>
                    <Flex justify="end" mt="4">
                      <Button
                          className="w-full cursor-pointer transition-colors duration-200"
                          variant="solid"
                          type="submit"
                          disabled={!values.every((value) => value.trim() !== "")}
                          onClick={() => handleNextStep()}>
                            Bekræft
                        </Button>
                    </Flex>
                  </Box>
                )}

                {currentStep === 3 && (
                  <Box>
                    <Heading mb='1'>Du er der næsten!</Heading>
                      <Text color="gray" size="2">
                        Opret en ny adgangskode, sørg for at du kan huske den.
                      </Text>
                    <Flex mt="5" direction="column">
                      <TextField.Root
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Ny adgangskode"
                        variant="soft"
                        color="gray"
                        className="mt-2">
                        <Tooltip content={`${showConfirmPassword ? 'Skjul adgangskode' : 'Vis adgangskode'}`}>
                          <TextField.Slot side='right'>
                            <IconButton size="1" variant="ghost" onClick={() => setShowNewPassword(!showNewPassword)}>
                              <FontAwesomeIcon width={16} icon={showNewPassword ? faEyeSlash : faEye}/>
                            </IconButton>
                          </TextField.Slot>
                        </Tooltip>
                      </TextField.Root>
                      <TextField.Root
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Bekræft ny adgangskode"
                        variant="soft"
                        color="gray"
                        className="mt-2">
                        <Tooltip content={`${showConfirmPassword ? 'Skjul adgangskode' : 'Vis adgangskode'}`}>
                          <TextField.Slot side='right'>
                            <IconButton size="1" variant="ghost" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              <FontAwesomeIcon width={16} icon={showConfirmPassword ? faEyeSlash : faEye}/>
                            </IconButton>
                          </TextField.Slot>
                        </Tooltip>
                      </TextField.Root>
                    </Flex>
                    <Flex justify="end" mt="4">
                      <Button
                          className="w-full cursor-pointer"
                          variant="solid"
                          type="submit"
                          onClick={() => handleNextStep()}>
                            Bekræft
                        </Button>
                    </Flex>
                  </Box>
                )}
              </animated.div>
            ))}
            </form>
          </div>
        </AnimatedCard>
      </Flex>
    </Flex>
  );
}
