import React, {Fragment, useEffect, useState} from 'react';
import { Card, Flex, Text, Badge, Link, Separator, Button } from '@radix-ui/themes';
import { format } from 'date-fns';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes, GameResponse, BoardGameHistoryResponse } from '../import';
import { da } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

interface GameBoardHistoryCardProps {
    entry: BoardGameHistoryResponse;
    activeGame?: boolean;
}

export default function GameBoardHistoryCard({ entry, activeGame = false }: GameBoardHistoryCardProps) {
    return (
        <Card className="p-4">
            <Flex direction="column" gap="2">
            <Flex direction="row" align="center" justify="between" wrap="nowrap" gap="4" className="w-full">
                <Text>
                    {entry.user?.firstName} {entry.user?.lastName} 
                </Text>
                <Text size="5" weight="bold">
                    {entry.price},-
                </Text>
            </Flex>
            <Flex>
            {entry.configuration?.map((num, i) => (
                        <Fragment key={i}>
                            <Badge color={`${activeGame ? 'gray' : entry.wasWin ? 'green' : 'red'}`} size="1">{num}</Badge>
                            {i < (entry.configuration?.length || 0) - 1 && <Text>-</Text>}
                        </Fragment>
                    ))}
            </Flex>
                <Text size="2" color="gray">
                    {format(new Date(entry.placedOn), 'd. MMMM yyyy HH:mm', { locale: da })}
                </Text>
            </Flex>
            
        </Card>
    );
}