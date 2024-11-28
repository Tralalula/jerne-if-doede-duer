import { Box, Button, Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { Page } from "../components";

export default function Game() {
    return (
        <Page>
            <Flex justify='center' align='center' direction='column' className="w-full h-full">
            <Flex justify='center' align='center' direction='column' className="max-w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl w-full p-4">
                <Flex direction='column' className="text-center">
                <Heading className="text-2xl sm:text-2xl md:text-3xl">
                    Velkommen til denne uges spil!
                </Heading>
                <Text className="text-md">
                    Spillet er igang for uge: 46
                </Text>
                </Flex>
                <Flex py='6'>
                    <Flex gap='5' direction='column' align='center' justify='center' className="p-5 rounded-lg w-auto backdrop-blur-md bg-whiteA5 dark:bg-gray1/75" style={{ boxShadow: 'var(--shadow-5)'}}>
                        <Heading size='5'>
                            Vær med & vind
                        </Heading>
                        <Grid columns={{ initial: "3", md: "3" }} gap="5" width="auto">
                            <Flex justify='center' align='center' className="bg-red8/40 rounded-lg text-5xl relative p-3" >
                                <Flex align='baseline' className="relative">
                                    <Text weight='bold'>00</Text>
                                    <Text weight='bold' className="ml-1" size='3'>h</Text>
                                </Flex>
                            </Flex>
                            <Flex justify='center' align='center' className="bg-red8/40 rounded-lg text-5xl relative p-3" >
                                <Flex align='baseline' className="relative">
                                    <Text weight='bold'>00</Text>
                                    <Text weight='bold' className="ml-1" size='3'>m</Text>
                                </Flex>
                            </Flex>
                            <Flex justify='center' align='center' className="bg-red8/40 rounded-lg text-5xl relative p-3" >
                                <Flex align='baseline' className="relative">
                                    <Text weight='bold'>00</Text>
                                    <Text weight='bold' className="ml-1" size='3'>s</Text>
                                </Flex>
                            </Flex>
                        </Grid>
                        <Button className="transition-colors duration-200 cursor-pointer">
                            Vær med!
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
            <Flex align='center' justify='center' className="w-full h-full backdrop-blur-md bg-whiteA5 dark:bg-gray1/75">
                lorem
            </Flex>
            </Flex>
        </Page>
    )
}