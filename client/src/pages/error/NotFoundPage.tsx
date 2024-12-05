import { Text, Button, Flex } from "@radix-ui/themes";
import { Page } from "../../components";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../../helpers";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Page align="center" justify="center">
            <Flex direction="column" align="center" gap="5">
                <Text size="8" weight="bold" className="text-red-500">
                    404
                </Text>
                <Text size="6" weight="medium">
                    Siden blev ikke fundet
                </Text>
                <Text size="3" className="text-gray-500 mb-4 text-center max-w-md">
                    Beklager, men siden du leder efter findes ikke eller er blevet flyttet.
                </Text>
                <Button size="3" onClick={() => navigate(AppRoutes.Home)} className="bg-red-500 hover:bg-red-600">
                    Tilbage til forsiden
                </Button>
            </Flex>
        </Page>
    );
}