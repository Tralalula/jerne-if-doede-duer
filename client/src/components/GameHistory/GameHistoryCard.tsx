import React, {Fragment, useEffect, useState} from 'react';
import { Card, Flex, Text, Badge, Link, Separator, Button } from '@radix-ui/themes';
import { format } from 'date-fns';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes, GameResponse } from '../import';
import { da } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

interface GameHistoryCardProps {
    entry: GameResponse;
    showUserEmail?: boolean;
}

export default function GameHistoryCard({ entry, showUserEmail }: GameHistoryCardProps) {
    return (
        <Card className="p-4">
            <Flex direction="column" gap="2">
            <Flex direction="row" align="center" justify="between" wrap="nowrap" gap="4" className="w-full">
                <Text>
                    {format(new Date(entry.endTime), 'd. MMMM yyyy HH:mm', { locale: da })}
                </Text>
                <Text size="5" weight="bold">
                    {entry.week} Uge
                </Text>
            </Flex>
                <Text size="2" color="gray">
                    Start: {format(new Date(entry.startTime), 'd. MMMM yyyy HH:mm', { locale: da })}

                </Text>
            </Flex>
            <Button className='mt-2 cursor-pointer transition-colors duration-200' variant='outline'>
                    Flere oplysninger
            </Button>
        </Card>
    );
}