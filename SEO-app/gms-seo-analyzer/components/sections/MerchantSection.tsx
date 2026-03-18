'use client';

import { SectionWrapper, NoDataCard } from '@/components/ui';
import type { MerchantData } from '@/types';

export default function MerchantSection({ data }: { data: MerchantData | null }) {
    if (!data || !data.hasPresence) return (
        <SectionWrapper id="merchant" title="Merchant (E-Commerce)" icon="🛒">
            <NoDataCard module="Merchant (E-Commerce)" />
        </SectionWrapper>
    );

    return (
        <SectionWrapper id="merchant" title="Merchant (E-Commerce)" icon="🛒">
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr><th>Product</th><th>Price</th><th>Seller</th><th>URL</th></tr>
                    </thead>
                    <tbody>
                        {data.products.map((p, i) => (
                            <tr key={i}>
                                <td className="font-medium text-white">{p.title}</td>
                                <td>{p.price || 'N/A'}</td>
                                <td>{p.seller || 'N/A'}</td>
                                <td>{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-electric-400 hover:underline">View</a> : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SectionWrapper>
    );
}
