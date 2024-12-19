import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Link, Flex, Text, Button, IconButton } from '@radix-ui/themes';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { BalanceAction, BalanceHistoryEntryResponse, getUserDetailsAtom, UserDetailsResponse, AppRoutes, BoardGameHistoryResponse, useFetchGameBoardHistory } from '../import';
import GameHistoryTableHeader from './GameBoardHistoryTableHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCross, faExclamation, faEye, faXmark, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

interface GameBoardHistoryTableProps {
    entries: BoardGameHistoryResponse[];
    activeGame?: boolean;
}

export default function GameBoardHistoryTable({ entries, activeGame = false }: GameBoardHistoryTableProps) {
    const navigate = useNavigate();

    return (
        <Table.Root variant="surface">
            <Table.Header>
                <Table.Row>
                    <GameHistoryTableHeader>Bruger</GameHistoryTableHeader>
                    <GameHistoryTableHeader>Beløb</GameHistoryTableHeader>
                    <Table.ColumnHeaderCell>Bræt</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Købsdato</Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {entries.map((e) => (
                    <Table.Row key={e.boardId}>
                        <Table.Cell>
                            {e.user?.firstName} {e.user?.lastName}
                        </Table.Cell>
                        <Table.Cell>
                            {e.price},-
                        </Table.Cell>
                        <Table.Cell>
                        {e.configuration?.map((num, i) => (
                            <Fragment key={i}>
                                <Badge color={`${activeGame ? 'gray' : e.wasWin ? 'green' : 'red'}`} size="1">{num}</Badge>
                                {i < (e.configuration?.length || 0) - 1 && <Text>-</Text>}
                            </Fragment>
                        ))}
                        </Table.Cell>
                        <Table.Cell>
                            {format(new Date(e.placedOn), 'd. MMMM yyyy HH:mm', { locale: da })}
                        </Table.Cell>

                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}