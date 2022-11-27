import React, { useEffect } from 'react';
import { useRender } from '../render';
import "./Login.css"

export default () => {
    const rd = useRender('login')

    return <>
        <div className='login-main-cont' style={{
            backgroundImage: `url("/art/background.png")`,
        }}>
            <div className='login-field-cont'>

            </div>
        </div>
    </>
}
