import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Link, Flex, Text } from '@radix-ui/themes';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes, BoardHistoryResponse } from '../import';
import BoardHistoryTableHeader from './BoardHistoryTableHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCross, faExclamation, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

interface BoardHistoryTableProps {
    entries: BoardHistoryResponse[];
    showUserEmail?: boolean;
}

export default function BoardHistoryTable({ entries, showUserEmail = false }: BoardHistoryTableProps) {
    const navigate = useNavigate();

    return (
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <BoardHistoryTableHeader>Spil uge</BoardHistoryTableHeader>
                    <BoardHistoryTableHeader>Dato</BoardHistoryTableHeader>
                    <Table.ColumnHeaderCell>Bræt</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Beløb</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {entries.map((entry) => (
                    <Table.Row key={entry.boardId}>
                        <Table.Cell>
                            {entry.gameWeek}
                        </Table.Cell>

                        <Table.Cell>
                            {format(new Date(entry.placedOn), 'd. MMMM yyyy HH:mm', { locale: da })}
                        </Table.Cell>
                        <Table.Cell>
                        {entry.configuration?.map((num, i) => (
                            <Fragment key={i}>
                                <Badge color={`${entry.isActiveGame ? 'gray' : entry.wasWin ? 'green' : 'red'}`} size="1">{num}</Badge>
                                {i < (entry.configuration?.length || 0) - 1 && <Text>-</Text>}
                            </Fragment>
                        ))}
                        </Table.Cell>
                        <Table.Cell>
                            {entry.price},-
                        </Table.Cell>
                        <Table.Cell>
                            {!entry.isActiveGame && 
                                <Badge className='p-1' color={`${entry.wasWin ? 'green' : 'red'}`}>
                                    <FontAwesomeIcon size="lg" icon={entry.wasWin ? faCheckCircle : faXmarkCircle} />
                                </Badge>
                            }

                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}