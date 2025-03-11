import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';
import { formatDateSlash } from '../../utils/globalUtils';

// Font registration
Font.register({
    family: 'Roboto',
    fonts: [
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
            fontWeight: 400,
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
            fontWeight: 500,
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
            fontWeight: 700,
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf',
            fontWeight: 900,
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
            fontWeight: 300,
        },
        {
            src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-thin-webfont.ttf',
            fontWeight: 100,
        },
    ],
});

// Theme constants
const COLORS = {
    background: '#ffffff',
    background2: '#fcfcf9',
    background3: '#f9faf5',
    background4: '#008cd7',
    border: '#f3f5ed',
    border2: '#dcdec5',
    bdrColor: '#000000',
    text: {
        primary: '#171717',
        secondary: '#424242',
    },
};

const SPACING = {
    xs: 2,
    sm: 5,
    md: 10,
    lg: 20,
    xl: 30,
};

const FONT_SIZES = {
    xs: 8,
    sm: 9,
    md: 10,
    mdl: 20,
    lg: 36,
};

// Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: COLORS.background,
        padding: SPACING.xl,
        fontFamily: 'Roboto',
    },
    header: {
        marginBottom: SPACING.lg,
        borderBottom: `1pt solid ${COLORS.border}`,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZES.mdl,
        textAlign: 'right',
        color: COLORS.text.primary,
        fontWeight: 900,
        textTransform: 'uppercase',
    },
    infoSection: {
        flexDirection: 'row',
        marginVertical: 0,
        borderBottom: `1pt solid ${COLORS.border}`,
        paddingBottom: SPACING.lg,
    },
    infoColumn: {
        flex: 1,
        paddingHorizontal: SPACING.xs,
    },
    columnTitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        fontWeight: 700,
        marginBottom: SPACING.md,
    },
    infoText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
        fontWeight: 400,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        fontWeight: 400,
        textAlign: 'left',
    },
    infoValue: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        fontWeight: 400,
        textAlign: 'left',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.background4,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 0,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tableCol: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
    },
    tableCell: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        fontWeight: 400,
        textAlign: 'left',
    },
    tableCell2: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        fontWeight: 400,
        textAlign: 'left',
    },
    totalSection: {
        marginTop: SPACING.lg,
        borderTop: `1pt solid ${COLORS.border}`,
        paddingTop: SPACING.md,
        alignItems: 'flex-end',
    },
    footer: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: SPACING.xl,
        right: SPACING.xl,
        textAlign: 'center',
        color: COLORS.text.secondary,
        fontSize: FONT_SIZES.xs,
        borderTop: `1pt solid ${COLORS.border}`,
        paddingTop: SPACING.md,
        fontWeight: 300,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 3,
        paddingBottom: 7,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    totalLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        fontWeight: 700,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        textAlign: 'left',
    },
    totalValue: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
        fontWeight: 700,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        textAlign: 'right',
    },
    logo: {
        width: 70,
        height: 44,
    },
});

const BillInfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const TableRow = ({ label, value, isHeader = false, alignRight = false }) => (
    <View style={styles.tableRow}>
        <View style={styles.tableCol}>
            <Text style={[styles.tableCell, isHeader && { fontWeight: 700 }]}>
                {label}
            </Text>
        </View>
        <View style={styles.tableCol}>
            <Text
                style={[
                    styles.tableCell,
                    { textAlign: alignRight ? 'right' : 'left' },
                    isHeader && { fontWeight: 700 },
                ]}>
                {value}
            </Text>
        </View>
    </View>
);

const Documents = ({ billData, invoiceId }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View
                    style={[
                        styles.tableRow,
                        {
                            paddingBottom: SPACING.xl,
                            marginLeft: 0,
                            marginRight: 0,
                            alignItems: 'center',
                        },
                    ]}>
                    <View style={styles.tableCol}>
                        <Image src="images/bi-logo.png" style={styles.logo} />
                    </View>
                    <View
                        style={[
                            styles.tableCol,
                            { flex: 1, borderBottom: `0pt` },
                        ]}>
                        <View
                            style={[
                                styles.header,
                                { flex: 1, borderBottom: `0pt` },
                            ]}>
                            <Text style={styles.headerTitle}>
                                Electricity Charges
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        styles.table,
                        {
                            marginTop: SPACING.lg,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        },
                    ]}>
                    {/* Bill From Column */}
                    <View style={{ width: '30%' }}>
                        <Text style={styles.columnTitle}>Bill From</Text>
                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                }}>
                                <Text>Best Infra,</Text>
                            </View>
                        </View>
                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                }}>
                                <Text>Sun City,</Text>
                            </View>
                        </View>
                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                }}>
                                <Text>Hi-Tech City,</Text>
                            </View>
                        </View>
                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                }}>
                                <Text>Kondapur,</Text>
                            </View>
                        </View>
                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                }}>
                                <Text>Hyderabad - 500084</Text>
                            </View>
                        </View>
                    </View>

                    {/* Bill To Column */}
                    <View style={{ width: '30%' }}>
                        <Text style={styles.columnTitle}>Bill To</Text>

                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Resident Name
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        {
                                            textAlign: 'center',
                                            fontWeight: 400,
                                        },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    {billData.consumer_name ?? ''}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Flat No
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        {
                                            textAlign: 'center',
                                            fontWeight: 400,
                                        },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    {billData.flat_no ?? ''}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Block
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        {
                                            textAlign: 'center',
                                            fontWeight: 400,
                                        },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    {billData.block_name ?? ''}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Project
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        {
                                            textAlign: 'center',
                                            fontWeight: 400,
                                        },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Sun City
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Location
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        {
                                            textAlign: 'center',
                                            fontWeight: 400,
                                        },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.xs,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Hi-tech City, Kondapur, Hyderabad - 500084
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Details Column */}
                    <View style={{ width: '30%' }}>
                        <Text style={styles.columnTitle}>Details</Text>
                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Bill No{' '}
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'right', fontWeight: 400 },
                                    ]}>
                                    {invoiceId}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Bill Date
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'right', fontWeight: 400 },
                                    ]}>
                                    {formatDateSlash(billData?.bill_date)}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[styles.tableRow, { borderBottom: `0pt` }]}>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '30%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    Due Date
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    flex: 1,
                                    width: '10%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'left', fontWeight: 400 },
                                    ]}>
                                    :
                                </Text>
                            </View>
                            <View
                                style={{
                                    fontSize: FONT_SIZES.sm,
                                    color: COLORS.text.secondary,
                                    fontWeight: 400,
                                    width: '60%',
                                }}>
                                <Text
                                    style={[
                                        styles.tableCell,
                                        { textAlign: 'right', fontWeight: 400 },
                                    ]}>
                                    {formatDateSlash(billData?.due_date)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.table, { marginTop: SPACING.lg }]}>
                    <View
                        style={[
                            styles.table,
                            {
                                alignSelf: 'flex-end',
                                width: '45%',
                                marginTop: SPACING.md,
                            },
                        ]}>
                        <View style={styles.tableHeader}>
                            <View style={styles.tableCol}>
                                <Text
                                    style={[
                                        styles.tableCell2,
                                        { fontWeight: 700 },
                                    ]}>
                                    Meter Details
                                </Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text
                                    style={[
                                        styles.tableCell2,
                                        { fontWeight: 700, textAlign: 'right' },
                                    ]}>
                                    Value
                                </Text>
                            </View>
                        </View>
                        <TableRow
                            label="Previous Reading (KWh)"
                            value={billData?.previous_reading}
                            alignRight={true}
                        />
                        <TableRow
                            label="Present Reading (KWh)"
                            value={billData?.current_reading}
                            alignRight={true}
                        />
                        <TableRow
                            label="Consumption (KWh)"
                            value={billData?.consumption}
                            alignRight={true}
                        />
                        <TableRow
                            label="Tariff Type"
                            value={billData?.tariff}
                            alignRight={true}
                        />
                    </View>
                    <View
                        style={[
                            styles.table,
                            { alignSelf: 'flex-end', width: '45%' },
                        ]}></View>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <View
                        style={[
                            styles.infoColumn,
                            { marginRight: SPACING.md, marginTop: SPACING.lg },
                        ]}></View>
                </View>

                <View
                    style={[
                        styles.table,
                        {
                            alignSelf: 'flex-end',
                            width: '45%',
                            marginTop: SPACING.xs,
                            backgroundColor: `${COLORS.background4}`,
                            borderColor: `${COLORS.bdrColor}`,
                            borderTop: `1pt solid ${COLORS.border2}`,
                        },
                    ]}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, { flex: 1 }]}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { textAlign: 'left', fontWeight: 700 },
                                ]}>
                                Bill Amount (Rs.)
                            </Text>
                        </View>
                        <View style={[styles.tableCol, { flex: 1 }]}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { textAlign: 'center' },
                                ]}>
                                :
                            </Text>
                        </View>
                        <View style={[styles.tableCol, { flex: 1 }]}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { textAlign: 'right', fontWeight: 700 },
                                ]}>
                                {billData?.amount || '0.00'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, { flex: 1 }]}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { textAlign: 'left', fontWeight: 700 },
                                ]}>
                                Total Amount (Rs.)
                            </Text>
                        </View>
                        <View style={[styles.tableCol, { flex: 1 }]}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { textAlign: 'center' },
                                ]}>
                                :
                            </Text>
                        </View>
                        <View style={[styles.tableCol, { flex: 1 }]}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { textAlign: 'right', fontWeight: 700 },
                                ]}>
                                {billData?.total_bill_with_overdue || '0.00'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        styles.table,
                        { marginTop: SPACING.lg, marginBottom: SPACING.lg },
                    ]}>
                    <View style={styles.tableHeader}>
                        <View style={styles.tableCol}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { fontWeight: 700 },
                                ]}>
                                Previous Balance
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { fontWeight: 700 },
                                ]}>
                                Payments
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { fontWeight: 700 },
                                ]}>
                                Adjustments
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { fontWeight: 700 },
                                ]}>
                                This Month Charges
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text
                                style={[
                                    styles.tableCell2,
                                    { fontWeight: 700 },
                                ]}>
                                Amount Due
                            </Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}>
                            <Text style={[styles.tableCell]}>
                                {billData?.previous_balance || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={[styles.tableCell]}>
                                {billData?.payments || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={[styles.tableCell]}>
                                {billData?.adjustments || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={[styles.tableCell]}>
                                {billData?.total_bill || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={[styles.tableCell]}>
                                {billData?.total_bill_with_overdue || '0.00'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    style={[
                        styles.infoColumn,
                        {
                            marginRight: SPACING.md,
                            marginTop: SPACING.xs,
                            fontSize: FONT_SIZES.xs,
                        },
                    ]}>
                    <Text
                        style={[
                            styles.columnTitle,
                            { fontSize: FONT_SIZES.xs },
                        ]}>
                        Bank Details
                    </Text>
                    <Text
                        style={[styles.infoText, { fontSize: FONT_SIZES.xs }]}>
                        Account Name: BEST INFRA
                    </Text>
                    <Text
                        style={[styles.infoText, { fontSize: FONT_SIZES.xs }]}>
                        Account Number: 79260400000286
                    </Text>
                    <Text
                        style={[styles.infoText, { fontSize: FONT_SIZES.xs }]}>
                        IFSC Code: BARB0VJMIYA
                    </Text>
                    <Text
                        style={[styles.infoText, { fontSize: FONT_SIZES.xs }]}>
                        Bank: Bank of Baroda
                    </Text>
                    <Text
                        style={[styles.infoText, { fontSize: FONT_SIZES.xs }]}>
                        Branch: MIYAPUR, HYDERABAD
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.infoText,
                            { fontSize: FONT_SIZES.xs, marginBottom: 5 },
                        ]}>
                        This is system generated bill and is valid for all
                        purposes. Please pay your bill before the due date to
                        avoid late fees.
                    </Text>
                    <Text
                        style={[
                            styles.infoText,
                            { fontSize: FONT_SIZES.sm, fontWeight: 700 },
                        ]}>
                        Powered by Lauritz Knudsen 2025
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default Documents;
