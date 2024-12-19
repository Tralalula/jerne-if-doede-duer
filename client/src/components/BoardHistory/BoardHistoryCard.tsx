import React, {Fragment, useEffect, useState} from 'react';
import { Card, Flex, Text, Badge, Link, Separator } from '@radix-ui/themes';
import { format } from 'date-fns';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes, BoardHistoryResponse } from '../import';
import { da } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

interface BoardHistoryCardProps {
    entry: BoardHistoryResponse;
    showUserEmail?: boolean;
}

export default function BoardHistoryCard({ entry, showUserEmail }: BoardHistoryCardProps) {
    return (
        <Card className="p-4">
            <Flex direction="column" gap="2">
            <Flex direction="row" align="center" justify="between" wrap="nowrap" gap="4" className="w-full">
                <Flex direction="row" align="center" wrap="wrap">
                    {!entry.isActiveGame &&
                    <>
                    <Badge className='p-1 mr-2' color={`${entry.wasWin ? 'green' : 'red'}`}>
                        <FontAwesomeIcon size="lg" icon={entry.wasWin ? faCheckCircle : faXmarkCircle} />
                    </Badge>
                    <Separator className='mr-2' orientation="vertical"/>
                    </>
                }
                    {entry.configuration?.map((num, i) => (
                        <Fragment key={i}>
                            <Badge 
                                className="flex-none" 
                                color={`${entry.isActiveGame ? 'gray' : entry.wasWin ? 'green' : 'red'}`} 
                                size="1"
                            >
                                {num}
                            </Badge>
                            {i < (entry.configuration?.length || 0) - 1 && <Text>-</Text>}
                        </Fragment>
                    ))}
                </Flex>
                <Text size="5" weight="bold" className="ml-auto">
                    {entry.price},-
                </Text>
            </Flex>
                <Text size="2" color="gray">
                    Uge: {entry.gameWeek} - {format(new Date(entry.placedOn), 'd. MMMM yyyy HH:mm', { locale: da })}
                </Text>
            </Flex>
        </Card>
    );
}