import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Link, Flex, Text, Button, IconButton } from '@radix-ui/themes';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes, GameResponse } from '../import';
import GameHistoryTableHeader from './GameHistoryTableHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCross, faExclamation, faEye, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

interface GameHistoryTableProps {
    entries: GameResponse[];
}

export default function GameHistoryTable({ entries}: GameHistoryTableProps) {
    const navigate = useNavigate();

    return (
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <GameHistoryTableHeader>Uge</GameHistoryTableHeader>
                    <GameHistoryTableHeader>Start</GameHistoryTableHeader>
                    <Table.ColumnHeaderCell>Slut</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Deltagere</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Pulje</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {entries.map((entry) => (
                    <Table.Row key={entry.id}>
                        <Table.Cell>
                            <Badge color={`${entry.active ? 'green' : 'red'}`}>
                                <Text>
                                    {entry.week}
                                </Text>
                            </Badge>
                        </Table.Cell>
                        <Table.Cell>
                            {format(new Date(entry.startTime), 'd. MMMM yyyy HH:mm', { locale: da })}
                        </Table.Cell>
                        <Table.Cell>
                            {format(new Date(entry.endTime), 'd. MMMM yyyy HH:mm', { locale: da })}
                        </Table.Cell>
                        <Table.Cell>
                            {entry.entries}
                        </Table.Cell>
                        <Table.Cell>
                            {entry.totalPool},-
                        </Table.Cell>

                        <Table.Cell>
                            <Button size='1' className='cursor-pointer transition-colors duration-200' onClick={() => navigate(AppRoutes.AdminGameBoardHistory.replace(':gameId', entry.id))}>
                                <FontAwesomeIcon icon={faEye}/>
                            </Button>
                        </Table.Cell>

                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}